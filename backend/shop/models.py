import json
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    full_name = models.CharField(max_length=160, blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    role = models.CharField(max_length=20, default="customer")
    address = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=80, blank=True, default="")
    pincode = models.CharField(max_length=12, blank=True, default="")

    def save(self, *args, **kwargs):
        if not self.full_name:
            self.full_name = f"{self.first_name} {self.last_name}".strip()
        super().save(*args, **kwargs)


class Category(models.Model):
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=180, unique=True)
    image = models.CharField(max_length=500, blank=True, default="")
    description = models.TextField(blank=True, default="")
    icon = models.CharField(max_length=80, default="sports")
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=220)
    slug = models.SlugField(max_length=240, unique=True)
    sku = models.CharField(max_length=40, unique=True)
    brand = models.CharField(max_length=150)
    image = models.CharField(max_length=500, blank=True, default="")
    quantity = models.IntegerField(default=0)
    original_price = models.FloatField()
    selling_price = models.FloatField()
    description = models.TextField(blank=True, default="")
    status = models.BooleanField(default=True)
    trending = models.BooleanField(default=False)
    rating = models.FloatField(default=4.3)
    reviews_count = models.IntegerField(default=0)
    length_cm = models.FloatField(default=0)
    width_cm = models.FloatField(default=0)
    height_cm = models.FloatField(default=0)
    weight_g = models.IntegerField(default=0)
    material = models.CharField(max_length=160, blank=True, default="")
    color = models.CharField(max_length=60, blank=True, default="")
    size = models.CharField(max_length=40, blank=True, default="")
    gender = models.CharField(max_length=20, default="unisex")
    features = models.TextField(blank=True, default="[]")
    highlights = models.TextField(blank=True, default="")
    warranty_months = models.IntegerField(default=6)
    country_of_origin = models.CharField(max_length=80, default="India")
    care_instructions = models.CharField(max_length=255, blank=True, default="")
    suitable_for = models.CharField(max_length=160, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def feature_list(self):
        try:
            data = json.loads(self.features or "[]")
            return data if isinstance(data, list) else []
        except json.JSONDecodeError:
            return []

    def __str__(self):
        return self.name


class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cart_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")


class WishlistItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    total_amount = models.FloatField()
    status = models.CharField(max_length=30, default="placed")
    payment_method = models.CharField(max_length=40, default="cod")
    payment_status = models.CharField(max_length=30, default="pending")
    payment_ref = models.CharField(max_length=80, blank=True, default="")
    customer_email = models.CharField(max_length=160, blank=True, default="")
    customer_name = models.CharField(max_length=160, blank=True, default="")
    address = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=80, blank=True, default="")
    pincode = models.CharField(max_length=12, blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=220)
    brand = models.CharField(max_length=150, blank=True, default="")
    image = models.CharField(max_length=500, blank=True, default="")
    quantity = models.IntegerField(default=1)
    unit_price = models.FloatField()


class SiteSettings(models.Model):
    store_name = models.CharField(max_length=80, default="Bigdots")
    email = models.CharField(max_length=160, default="kumareshtfc@gmail.com")
    phone = models.CharField(max_length=20, default="+916379149227")
    website = models.CharField(max_length=255, default="https://www.decathlon.in/")
    address = models.CharField(max_length=255, default="Chennai, Tamil Nadu")
    whatsapp = models.CharField(max_length=20, default="916379149227")
