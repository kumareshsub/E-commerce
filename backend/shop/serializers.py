from rest_framework import serializers
from .models import CartItem, Category, Order, OrderItem, Product, SiteSettings, User, WishlistItem


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id", "username", "email", "full_name", "phone", "role",
            "is_active", "address", "city", "pincode", "date_joined",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["created_at"] = data.pop("date_joined")
        return data


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "image", "description", "icon", "status")


class ProductSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(source="category.id", read_only=True)
    category = CategorySerializer(read_only=True)
    features = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id", "category_id", "category", "name", "slug", "sku", "brand", "image",
            "quantity", "original_price", "selling_price", "description", "status",
            "trending", "rating", "reviews_count", "length_cm", "width_cm", "height_cm",
            "weight_g", "material", "color", "size", "gender", "features", "highlights",
            "warranty_months", "country_of_origin", "care_instructions", "suitable_for",
        )

    def get_features(self, obj):
        return obj.feature_list()


class ProductWriteSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField()

    class Meta:
        model = Product
        fields = (
            "category_id", "name", "slug", "sku", "brand", "image", "quantity",
            "original_price", "selling_price", "description", "status", "trending",
            "rating", "reviews_count", "length_cm", "width_cm", "height_cm", "weight_g",
            "material", "color", "size", "gender", "features", "highlights",
            "warranty_months", "country_of_origin", "care_instructions", "suitable_for",
        )
        extra_kwargs = {
            "sku": {"required": False, "allow_blank": True},
            "slug": {"required": False, "allow_blank": True},
            "image": {"required": False, "allow_blank": True},
            "description": {"required": False, "allow_blank": True},
            "features": {"required": False, "allow_blank": True},
            "highlights": {"required": False, "allow_blank": True},
        }

    def _normalize(self, validated):
        import json
        from django.utils.text import slugify

        features = validated.get("features")
        if isinstance(features, list):
            validated["features"] = json.dumps(features)
        if not validated.get("sku"):
            if self.instance:
                validated.pop("sku", None)
            else:
                validated["sku"] = f"BD-NEW-{Product.objects.count() + 1:05d}"
        if not validated.get("slug"):
            if self.instance:
                validated.pop("slug", None)
            else:
                base = slugify(validated.get("name") or "product")[:200] or "product"
                slug = base
                n = 1
                while Product.objects.filter(slug=slug).exists():
                    slug = f"{base}-{n}"
                    n += 1
                validated["slug"] = slug
        return validated

    def create(self, validated):
        category_id = validated.pop("category_id")
        validated = self._normalize(validated)
        return Product.objects.create(category_id=category_id, **validated)

    def update(self, instance, validated):
        category_id = validated.pop("category_id", None)
        if category_id:
            instance.category_id = category_id
        validated = self._normalize(validated)
        for key, value in validated.items():
            setattr(instance, key, value)
        instance.save()
        return instance


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "product_id", "quantity", "product")


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ("id", "product_id", "product")


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "product_id", "product_name", "brand", "image", "quantity", "unit_price")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id", "total_amount", "status", "payment_method", "payment_status",
            "payment_ref", "customer_email", "customer_name", "address", "city",
            "pincode", "phone", "created_at", "items",
        )


class SiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ("store_name", "email", "phone", "website", "address", "whatsapp")
