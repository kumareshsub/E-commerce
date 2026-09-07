import uuid
from django.contrib.auth import authenticate
from django.db.models import Q, Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken

from .models import CartItem, Category, Order, OrderItem, Product, SiteSettings, User, WishlistItem
from .serializers import (
    CartItemSerializer,
    CategorySerializer,
    OrderSerializer,
    ProductSerializer,
    ProductWriteSerializer,
    SiteSerializer,
    UserSerializer,
    WishlistItemSerializer,
)


def token_for(user):
    return str(AccessToken.for_user(user))


def error(message, status=400):
    return Response({"detail": message}, status=status)


def require_roles(user, *roles):
    return user.is_authenticated and user.role in roles


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok", "app": "Bigdots", "engine": "django"})


@api_view(["GET"])
@permission_classes([AllowAny])
def site(request):
    row = SiteSettings.objects.first() or SiteSettings()
    return Response(SiteSerializer(row).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    if User.objects.filter(username=data.get("username")).exists():
        return error("Username already taken")
    if User.objects.filter(email=data.get("email")).exists():
        return error("Email already registered")
    user = User.objects.create_user(
        username=data.get("username"),
        email=data.get("email", ""),
        password=data.get("password"),
        full_name=data.get("full_name", ""),
        phone=data.get("phone", ""),
        role="customer",
    )
    return Response({"access_token": token_for(user), "token_type": "bearer", "user": UserSerializer(user).data})


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if not user:
        return error("Invalid username or password", 401)
    if not user.is_active:
        return error("Account is disabled", 403)
    return Response({"access_token": token_for(user), "token_type": "bearer", "user": UserSerializer(user).data})


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    if request.method == "PUT":
        for field in ("full_name", "phone", "address", "city", "pincode"):
            if field in request.data:
                setattr(user, field, request.data.get(field) or "")
        user.save()
    return Response(UserSerializer(user).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def categories(request):
    return Response(CategorySerializer(Category.objects.filter(status=True).order_by("name"), many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def category_detail(request, slug):
    cat = Category.objects.filter(slug=slug, status=True).first()
    if not cat:
        return error("Category not found", 404)
    return Response(CategorySerializer(cat).data)


def product_queryset(request):
    qs = Product.objects.select_related("category").filter(status=True)
    q = request.GET.get("q")
    if q:
        qs = qs.filter(Q(name__icontains=q) | Q(brand__icontains=q) | Q(description__icontains=q) | Q(color__icontains=q))
    category = request.GET.get("category")
    if category:
        qs = qs.filter(category__slug=category)
    brand = request.GET.get("brand")
    if brand:
        qs = qs.filter(brand=brand)
    if request.GET.get("trending") == "true":
        qs = qs.filter(trending=True)
    min_price = request.GET.get("min_price")
    max_price = request.GET.get("max_price")
    if min_price:
        qs = qs.filter(selling_price__gte=float(min_price))
    if max_price:
        qs = qs.filter(selling_price__lte=float(max_price))
    sort = request.GET.get("sort", "popular")
    if sort == "price_asc":
        qs = qs.order_by("selling_price")
    elif sort == "price_desc":
        qs = qs.order_by("-selling_price")
    elif sort == "newest":
        qs = qs.order_by("-created_at")
    elif sort == "rating":
        qs = qs.order_by("-rating")
    else:
        qs = qs.order_by("-reviews_count", "-trending")
    return qs


@api_view(["GET"])
@permission_classes([AllowAny])
def products(request):
    qs = product_queryset(request)
    total = qs.count()
    try:
        page = max(int(request.GET.get("page", 1)), 1)
        limit = min(max(int(request.GET.get("limit", 24)), 1), 60)
    except ValueError:
        page, limit = 1, 24
    start = (page - 1) * limit
    items = qs[start:start + limit]
    pages = max((total + limit - 1) // limit, 1)
    return Response({
        "items": ProductSerializer(items, many=True).data,
        "total": total,
        "page": page,
        "pages": pages,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def brands(request):
    names = list(Product.objects.filter(status=True).values_list("brand", flat=True).distinct().order_by("brand"))
    return Response(names)


@api_view(["GET"])
@permission_classes([AllowAny])
def product_detail(request, product_id):
    product = Product.objects.select_related("category").filter(id=product_id, status=True).first()
    if not product:
        return error("Product not found", 404)
    return Response(ProductSerializer(product).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def product_by_slug(request, slug):
    product = Product.objects.select_related("category").filter(slug=slug, status=True).first()
    if not product:
        return error("Product not found", 404)
    return Response(ProductSerializer(product).data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def cart(request):
    if request.method == "GET":
        items = CartItem.objects.select_related("product", "product__category").filter(user=request.user)
        return Response(CartItemSerializer(items, many=True).data)
    product = Product.objects.filter(id=request.data.get("product_id"), status=True).first()
    if not product:
        return error("Product not found", 404)
    qty = int(request.data.get("quantity") or 1)
    item = CartItem.objects.filter(user=request.user, product=product).first()
    new_qty = (item.quantity + qty) if item else qty
    if new_qty > product.quantity:
        return error("Product stock not available")
    if item:
        item.quantity = new_qty
        item.save()
    else:
        item = CartItem.objects.create(user=request.user, product=product, quantity=qty)
    item = CartItem.objects.select_related("product", "product__category").get(id=item.id)
    return Response(CartItemSerializer(item).data)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def cart_item(request, item_id):
    item = CartItem.objects.select_related("product", "product__category").filter(id=item_id, user=request.user).first()
    if not item:
        return error("Cart item not found", 404)
    if request.method == "DELETE":
        item.delete()
        return Response({"ok": True})
    qty = int(request.data.get("quantity") or 1)
    if qty > item.product.quantity:
        return error("Product stock not available")
    item.quantity = qty
    item.save()
    return Response(CartItemSerializer(item).data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def wishlist(request):
    if request.method == "GET":
        items = WishlistItem.objects.select_related("product", "product__category").filter(user=request.user)
        return Response(WishlistItemSerializer(items, many=True).data)
    product = Product.objects.filter(id=request.data.get("product_id"), status=True).first()
    if not product:
        return error("Product not found", 404)
    if WishlistItem.objects.filter(user=request.user, product=product).exists():
        return error("Product already in wishlist")
    item = WishlistItem.objects.create(user=request.user, product=product)
    item = WishlistItem.objects.select_related("product", "product__category").get(id=item.id)
    return Response(WishlistItemSerializer(item).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def wishlist_item(request, item_id):
    item = WishlistItem.objects.filter(id=item_id, user=request.user).first()
    if not item:
        return error("Wishlist item not found", 404)
    item.delete()
    return Response({"ok": True})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def wishlist_by_product(request, product_id):
    item = WishlistItem.objects.filter(user=request.user, product_id=product_id).first()
    if not item:
        return error("Wishlist item not found", 404)
    item.delete()
    return Response({"ok": True})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def orders(request):
    if request.method == "GET":
        qs = Order.objects.prefetch_related("items").filter(user=request.user).order_by("-created_at")
        return Response(OrderSerializer(qs, many=True).data)
    payload = request.data
    method = payload.get("payment_method", "cod")
    if method not in ("cod", "upi", "card"):
        return error("Choose COD, UPI or Card")
    if method == "upi" and not payload.get("upi_id"):
        return error("Enter your UPI ID")
    if method == "card" and len(str(payload.get("card_last4") or "")) < 4:
        return error("Enter a valid card number")
    cart_items = list(CartItem.objects.select_related("product").filter(user=request.user))
    if not cart_items:
        return error("Your cart is empty")
    total = 0
    for item in cart_items:
        if item.product.quantity < item.quantity:
            return error(f"{item.product.name} is out of stock")
        total += item.quantity * item.product.selling_price
    online = method in ("upi", "card")
    order = Order.objects.create(
        user=request.user,
        total_amount=round(total, 2),
        status="placed",
        payment_method=method,
        payment_status="paid" if online else "pending",
        payment_ref=f"BD-{method.upper()}-{uuid.uuid4().hex[:8].upper()}",
        customer_email=request.user.email,
        customer_name=request.user.full_name or request.user.username,
        address=payload.get("address", ""),
        city=payload.get("city", ""),
        pincode=payload.get("pincode", ""),
        phone=payload.get("phone", ""),
    )
    for item in cart_items:
        OrderItem.objects.create(
            order=order,
            product=item.product,
            product_name=item.product.name,
            brand=item.product.brand,
            image=item.product.image,
            quantity=item.quantity,
            unit_price=item.product.selling_price,
        )
        item.product.quantity -= item.quantity
        item.product.save(update_fields=["quantity"])
        item.delete()
    user = request.user
    user.address = payload.get("address", "")
    user.city = payload.get("city", "")
    user.pincode = payload.get("pincode", "")
    user.phone = payload.get("phone", "")
    user.save()
    order = Order.objects.prefetch_related("items").get(id=order.id)
    return Response(OrderSerializer(order).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    order = Order.objects.prefetch_related("items").filter(id=order_id, user=request.user).first()
    if not order:
        return error("Order not found", 404)
    return Response(OrderSerializer(order).data)


def admin_gate(request, super_only=False):
    if not require_roles(request.user, "admin", "superadmin"):
        return error("Admin access required", 403)
    if super_only and request.user.role != "superadmin":
        return error("Super admin access required", 403)
    return None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    blocked = admin_gate(request)
    if blocked:
        return blocked
    data = {
        "role": request.user.role,
        "products": Product.objects.count(),
        "categories": Category.objects.count(),
        "orders": Order.objects.count(),
        "pending_orders": Order.objects.filter(status__in=["placed", "packed", "shipped"]).count(),
    }
    if request.user.role == "superadmin":
        data.update({
            "users": User.objects.count(),
            "revenue": Order.objects.filter(payment_status="paid").aggregate(v=Sum("total_amount"))["v"] or 0,
            "cod_pending": Order.objects.filter(payment_status="pending").aggregate(v=Sum("total_amount"))["v"] or 0,
            "refunds": Order.objects.filter(payment_status="refunded").aggregate(v=Sum("total_amount"))["v"] or 0,
        })
    return Response(data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def admin_categories(request):
    blocked = admin_gate(request)
    if blocked:
        return blocked
    if request.method == "GET":
        return Response(CategorySerializer(Category.objects.order_by("name"), many=True).data)
    if Category.objects.filter(Q(slug=request.data.get("slug")) | Q(name=request.data.get("name"))).exists():
        return error("Category already exists")
    cat = Category.objects.create(
        name=request.data.get("name"),
        slug=request.data.get("slug"),
        image=request.data.get("image", ""),
        description=request.data.get("description", ""),
        icon=request.data.get("icon", "sports"),
        status=request.data.get("status", True),
    )
    return Response(CategorySerializer(cat).data)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def admin_category_detail(request, category_id):
    blocked = admin_gate(request, super_only=request.method == "DELETE")
    if blocked:
        return blocked
    cat = Category.objects.filter(id=category_id).first()
    if not cat:
        return error("Category not found", 404)
    if request.method == "DELETE":
        cat.delete()
        return Response({"ok": True})
    for field in ("name", "slug", "image", "description", "icon", "status"):
        if field in request.data:
            setattr(cat, field, request.data.get(field))
    cat.save()
    return Response(CategorySerializer(cat).data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def admin_products(request):
    blocked = admin_gate(request)
    if blocked:
        return blocked
    if request.method == "GET":
        qs = Product.objects.select_related("category").order_by("-id")
        q = request.GET.get("q")
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(sku__icontains=q) | Q(brand__icontains=q))
        total = qs.count()
        page = max(int(request.GET.get("page", 1)), 1)
        limit = min(int(request.GET.get("limit", 20)), 50)
        start = (page - 1) * limit
        items = qs[start:start + limit]
        return Response({
            "items": ProductSerializer(items, many=True).data,
            "total": total,
            "page": page,
            "pages": max((total + limit - 1) // limit, 1),
        })
    payload = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
    if not payload.get("sku"):
        payload["sku"] = f"BD-NEW-{uuid.uuid4().hex[:8].upper()}"
    serializer = ProductWriteSerializer(data=payload)
    if not serializer.is_valid():
        return error(str(serializer.errors))
    product = serializer.save()
    return Response(ProductSerializer(Product.objects.select_related("category").get(id=product.id)).data)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def admin_product_detail(request, product_id):
    blocked = admin_gate(request, super_only=request.method == "DELETE")
    if blocked:
        return blocked
    product = Product.objects.filter(id=product_id).first()
    if not product:
        return error("Product not found", 404)
    if request.method == "DELETE":
        product.delete()
        return Response({"ok": True})
    serializer = ProductWriteSerializer(product, data=request.data, partial=True)
    if not serializer.is_valid():
        return error(str(serializer.errors))
    serializer.save()
    return Response(ProductSerializer(Product.objects.select_related("category").get(id=product.id)).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_orders(request):
    blocked = admin_gate(request)
    if blocked:
        return blocked
    qs = Order.objects.prefetch_related("items").order_by("-created_at")
    return Response(OrderSerializer(qs, many=True).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def admin_order_status(request, order_id):
    blocked = admin_gate(request)
    if blocked:
        return blocked
    order = Order.objects.prefetch_related("items").filter(id=order_id).first()
    if not order:
        return error("Order not found", 404)
    status_value = request.data.get("status")
    if status_value == "cancelled" and request.user.role != "superadmin" and order.payment_status == "paid":
        return error("Only super admin can cancel a paid order", 403)
    order.status = status_value
    order.save()
    return Response(OrderSerializer(order).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def admin_order_payment(request, order_id):
    blocked = admin_gate(request)
    if blocked:
        return blocked
    order = Order.objects.prefetch_related("items").filter(id=order_id).first()
    if not order:
        return error("Order not found", 404)
    status_value = request.data.get("payment_status")
    if status_value not in ("pending", "paid", "failed", "refunded"):
        return error("Invalid payment status")
    if status_value == "refunded" and request.user.role != "superadmin":
        return error("Only super admin can refund payments", 403)
    if status_value == "paid" and order.payment_status != "pending":
        return error("Only pending payments can be marked paid")
    order.payment_status = status_value
    order.save()
    return Response(OrderSerializer(order).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_payments(request):
    blocked = admin_gate(request, super_only=True)
    if blocked:
        return blocked
    qs = Order.objects.prefetch_related("items").order_by("-created_at")
    return Response(OrderSerializer(qs, many=True).data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def admin_users(request):
    blocked = admin_gate(request, super_only=True)
    if blocked:
        return blocked
    if request.method == "GET":
        return Response(UserSerializer(User.objects.order_by("-id"), many=True).data)
    role = request.data.get("role", "admin")
    if role not in ("admin", "customer"):
        return error("Super admin can create admin or customer accounts only")
    if User.objects.filter(Q(username=request.data.get("username")) | Q(email=request.data.get("email"))).exists():
        return error("User already exists")
    user = User.objects.create_user(
        username=request.data.get("username"),
        email=request.data.get("email"),
        password=request.data.get("password"),
        full_name=request.data.get("full_name", ""),
        role=role,
        is_staff=role == "admin",
    )
    return Response(UserSerializer(user).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, user_id):
    blocked = admin_gate(request, super_only=True)
    if blocked:
        return blocked
    user = User.objects.filter(id=user_id).first()
    if not user:
        return error("User not found", 404)
    if user.username == "superadmin":
        return error("Cannot change the default super admin")
    if "role" in request.data:
        if request.data["role"] not in ("admin", "customer"):
            return error("Invalid role")
        user.role = request.data["role"]
        user.is_staff = user.role == "admin"
    if "is_active" in request.data:
        user.is_active = bool(request.data["is_active"])
    user.save()
    return Response(UserSerializer(user).data)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def admin_settings(request):
    blocked = admin_gate(request, super_only=True)
    if blocked:
        return blocked
    row = SiteSettings.objects.first()
    if not row:
        row = SiteSettings.objects.create()
    if request.method == "PUT":
        for field in ("store_name", "email", "phone", "website", "address", "whatsapp"):
            if field in request.data:
                setattr(row, field, request.data.get(field))
        row.save()
    return Response(SiteSerializer(row).data)
