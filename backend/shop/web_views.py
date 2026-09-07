import uuid
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_http_methods, require_POST

from .models import CartItem, Category, Order, OrderItem, Product, User, WishlistItem


def after_login(user):
    if getattr(user, "role", "") in ("admin", "superadmin"):
        return "admin:index"
    return "home"


def _safe_next(request, fallback="home"):
    nxt = request.POST.get("next") or request.GET.get("next") or request.META.get("HTTP_REFERER")
    if nxt and nxt.startswith("/") and not nxt.startswith("//"):
        return nxt
    return reverse(fallback)


@require_http_methods(["GET", "POST"])
def login_page(request):
    if request.user.is_authenticated:
        return redirect(after_login(request.user))
    error = ""
    username = request.POST.get("username", "demo") if request.method == "POST" else "demo"
    if request.method == "POST":
        username = (request.POST.get("username") or "").strip()
        password = request.POST.get("password") or ""
        user = authenticate(request, username=username, password=password)
        if not user:
            error = "Invalid username or password"
        elif not user.is_active:
            error = "Account is disabled"
        else:
            login(request, user)
            messages.success(request, f"Welcome back, {user.full_name or user.username}")
            nxt = request.POST.get("next") or request.GET.get("next")
            if nxt and nxt.startswith("/") and not nxt.startswith("//"):
                return redirect(nxt)
            return redirect(after_login(user))
    return render(request, "shop/login.html", {"error": error, "username": username, "next": request.GET.get("next", "")})


@require_http_methods(["GET", "POST"])
def register_page(request):
    if request.user.is_authenticated:
        return redirect("home")
    error = ""
    form = {"username": "", "email": "", "full_name": "", "phone": ""}
    if request.method == "POST":
        form = {
            "username": (request.POST.get("username") or "").strip(),
            "email": (request.POST.get("email") or "").strip(),
            "full_name": (request.POST.get("full_name") or "").strip(),
            "phone": (request.POST.get("phone") or "").strip(),
        }
        password = request.POST.get("password") or ""
        if not form["username"] or not form["email"] or not password:
            error = "Username, email and password are required"
        elif User.objects.filter(username=form["username"]).exists():
            error = "Username already taken"
        elif User.objects.filter(email=form["email"]).exists():
            error = "Email already registered"
        else:
            user = User.objects.create_user(
                username=form["username"],
                email=form["email"],
                password=password,
                full_name=form["full_name"],
                phone=form["phone"],
                role="customer",
            )
            login(request, user)
            messages.success(request, "Account created. Start shopping!")
            return redirect("home")
    return render(request, "shop/register.html", {"error": error, "form": form})


def logout_page(request):
    logout(request)
    messages.info(request, "Logged out successfully")
    return redirect("login")


def home(request):
    return render(request, "shop/home.html", {
        "trending": Product.objects.filter(status=True, trending=True).order_by("-rating")[:8],
        "deals": Product.objects.filter(status=True).order_by("selling_price")[:8],
    })


def shop(request, slug=None):
    qs = Product.objects.select_related("category").filter(status=True)
    category = None
    if slug:
        category = get_object_or_404(Category, slug=slug, status=True)
        qs = qs.filter(category=category)
    q = request.GET.get("q", "").strip()
    if q:
        qs = qs.filter(Q(name__icontains=q) | Q(brand__icontains=q) | Q(color__icontains=q) | Q(description__icontains=q))
    qs = qs.order_by("-reviews_count", "-trending")
    page = Paginator(qs, 24).get_page(request.GET.get("page") or 1)
    return render(request, "shop/shop.html", {"products": page, "category": category, "q": q, "total": qs.count()})


def product_detail(request, slug):
    product = get_object_or_404(Product.objects.select_related("category"), slug=slug, status=True)
    off = 0
    if product.original_price > product.selling_price:
        off = round(((product.original_price - product.selling_price) / product.original_price) * 100)
    return render(request, "shop/product.html", {
        "product": product,
        "features": product.feature_list(),
        "off": off,
        "loved": request.user.is_authenticated and WishlistItem.objects.filter(user=request.user, product=product).exists(),
    })


def contact(request):
    return render(request, "shop/contact.html")


@require_POST
@login_required
def cart_add(request, product_id):
    product = get_object_or_404(Product, id=product_id, status=True)
    try:
        qty = max(int(request.POST.get("quantity") or 1), 1)
    except ValueError:
        qty = 1
    item = CartItem.objects.filter(user=request.user, product=product).first()
    new_qty = (item.quantity + qty) if item else qty
    if new_qty > product.quantity:
        messages.error(request, "Product stock not available")
        return redirect(_safe_next(request, "cart"))
    if item:
        item.quantity = new_qty
        item.save()
    else:
        CartItem.objects.create(user=request.user, product=product, quantity=qty)
    messages.success(request, "Added to cart")
    return redirect(_safe_next(request, "cart"))


@require_POST
@login_required
def cart_update(request, item_id):
    item = get_object_or_404(CartItem, id=item_id, user=request.user)
    try:
        qty = int(request.POST.get("quantity") or 1)
    except ValueError:
        qty = 1
    if qty < 1:
        item.delete()
        messages.info(request, "Removed from cart")
        return redirect("cart")
    if qty > item.product.quantity:
        messages.error(request, "Product stock not available")
        return redirect("cart")
    item.quantity = qty
    item.save()
    return redirect("cart")


@require_POST
@login_required
def cart_remove(request, item_id):
    CartItem.objects.filter(id=item_id, user=request.user).delete()
    messages.info(request, "Removed from cart")
    return redirect("cart")


@login_required
def cart(request):
    items = list(CartItem.objects.select_related("product").filter(user=request.user).order_by("-id"))
    subtotal = sum(item.quantity * item.product.selling_price for item in items)
    delivery = 0 if subtotal >= 999 else 49
    return render(request, "shop/cart.html", {
        "items": items,
        "subtotal": subtotal,
        "delivery": delivery,
        "payable": subtotal + delivery,
    })


@require_POST
@login_required
def wishlist_toggle(request, product_id):
    product = get_object_or_404(Product, id=product_id, status=True)
    item = WishlistItem.objects.filter(user=request.user, product=product).first()
    if item:
        item.delete()
        messages.info(request, "Removed from favourites")
    else:
        WishlistItem.objects.create(user=request.user, product=product)
        messages.success(request, "Saved to favourites")
    return redirect(_safe_next(request, "wishlist"))


@login_required
def wishlist(request):
    items = WishlistItem.objects.select_related("product").filter(user=request.user).order_by("-id")
    return render(request, "shop/wishlist.html", {"items": items})


@login_required
@require_http_methods(["GET", "POST"])
def checkout(request):
    items = list(CartItem.objects.select_related("product").filter(user=request.user))
    if not items:
        messages.info(request, "Your cart is empty")
        return redirect("cart")
    subtotal = sum(item.quantity * item.product.selling_price for item in items)
    delivery = 0 if subtotal >= 999 else 49
    payable = round(subtotal + delivery, 2)
    error = ""
    form = {
        "address": request.user.address,
        "city": request.user.city,
        "pincode": request.user.pincode,
        "phone": request.user.phone,
        "payment_method": "cod",
        "upi_id": "",
        "card_number": "",
        "card_expiry": "",
        "card_cvv": "",
    }
    if request.method == "POST":
        form.update({
            "address": (request.POST.get("address") or "").strip(),
            "city": (request.POST.get("city") or "").strip(),
            "pincode": (request.POST.get("pincode") or "").strip(),
            "phone": (request.POST.get("phone") or "").strip(),
            "payment_method": request.POST.get("payment_method") or "cod",
            "upi_id": (request.POST.get("upi_id") or "").strip(),
            "card_number": (request.POST.get("card_number") or "").strip(),
            "card_expiry": (request.POST.get("card_expiry") or "").strip(),
            "card_cvv": (request.POST.get("card_cvv") or "").strip(),
        })
        if not request.POST.get("place"):
            return render(request, "shop/checkout.html", {
                "items": items,
                "subtotal": subtotal,
                "delivery": delivery,
                "payable": payable,
                "form": form,
                "error": error,
            })
        method = form["payment_method"]
        if method not in ("cod", "upi", "card"):
            error = "Choose COD, UPI or Card"
        elif not form["address"] or not form["city"] or not form["pincode"] or not form["phone"]:
            error = "Enter your full delivery address"
        elif method == "upi" and "@" not in form["upi_id"]:
            error = "Enter your UPI ID"
        elif method == "card" and len(form["card_number"].replace(" ", "")) < 12:
            error = "Enter a valid card number"
        else:
            for item in items:
                if item.product.quantity < item.quantity:
                    error = f"{item.product.name} is out of stock"
                    break
            if not error:
                online = method in ("upi", "card")
                order = Order.objects.create(
                    user=request.user,
                    total_amount=payable,
                    status="placed",
                    payment_method=method,
                    payment_status="paid" if online else "pending",
                    payment_ref=f"BD-{method.upper()}-{uuid.uuid4().hex[:8].upper()}",
                    customer_email=request.user.email,
                    customer_name=request.user.full_name or request.user.username,
                    address=form["address"],
                    city=form["city"],
                    pincode=form["pincode"],
                    phone=form["phone"],
                )
                for item in items:
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
                user.address = form["address"]
                user.city = form["city"]
                user.pincode = form["pincode"]
                user.phone = form["phone"]
                user.save()
                messages.success(
                    request,
                    "Order placed. Pay on delivery." if method == "cod" else "Payment successful. Order placed.",
                )
                return redirect(f"{reverse('orders')}?placed={order.id}")
    return render(request, "shop/checkout.html", {
        "items": items,
        "subtotal": subtotal,
        "delivery": delivery,
        "payable": payable,
        "form": form,
        "error": error,
    })


@login_required
def orders(request):
    qs = Order.objects.prefetch_related("items").filter(user=request.user).order_by("-created_at")
    return render(request, "shop/orders.html", {"orders": qs, "placed": request.GET.get("placed")})


@login_required
@require_http_methods(["GET", "POST"])
def account(request):
    if request.method == "POST":
        user = request.user
        user.full_name = request.POST.get("full_name") or user.full_name
        user.phone = request.POST.get("phone") or ""
        user.address = request.POST.get("address") or ""
        user.city = request.POST.get("city") or ""
        user.pincode = request.POST.get("pincode") or ""
        user.save()
        messages.success(request, "Profile updated")
        return redirect("account")
    return render(request, "shop/account.html")
