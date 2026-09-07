from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import Category, Order, OrderItem, Product, SiteSettings, User


class SuperOnlyMixin:
    def has_module_permission(self, request):
        return bool(request.user.is_superuser or getattr(request.user, "role", "") == "superadmin")


@admin.register(User)
class UserAdmin(SuperOnlyMixin, DjangoUserAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_superuser", "is_active")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email")
    fieldsets = DjangoUserAdmin.fieldsets + (("Store role", {"fields": ("full_name", "phone", "role", "address", "city", "pincode")}),)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "status")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "brand", "color", "size", "selling_price", "quantity")
    list_filter = ("category", "brand", "gender")
    search_fields = ("name", "sku", "brand")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "brand", "quantity", "unit_price")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer_name", "total_amount", "status", "payment_status")
    inlines = [OrderItemInline]


@admin.register(SiteSettings)
class SiteAdmin(SuperOnlyMixin, admin.ModelAdmin):
    list_display = ("store_name", "email", "phone")
