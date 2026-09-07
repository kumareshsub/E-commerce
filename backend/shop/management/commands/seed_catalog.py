from django.contrib.auth.models import Permission
from django.core.management.base import BaseCommand
from shop.catalog import CATEGORIES, build_products
from shop.models import Category, Product, SiteSettings, User


class Command(BaseCommand):
    help = "Create default users, categories and 1000+ products"

    def handle(self, *args, **options):
        self._users()
        self._settings()
        self._categories()
        created = self._products()
        self.stdout.write(self.style.SUCCESS(f"Catalog ready. Products in database: {Product.objects.count()} (new {created})"))

    def _users(self):
        specs = [
            ("superadmin", "superadmin@bigdots.com", "SuperAdmin@123", "superadmin", True, True),
            ("admin", "admin@bigdots.com", "Admin@123", "admin", True, False),
            ("demo", "demo@bigdots.com", "Demo@123", "customer", False, False),
        ]
        for username, email, password, role, staff, superuser in specs:
            user, made = User.objects.get_or_create(username=username, defaults={"email": email})
            user.email = email
            user.role = role
            user.is_staff = staff
            user.is_superuser = superuser
            user.is_active = True
            user.full_name = username.title()
            if username == "demo":
                user.address = "12 MG Road"
                user.city = "Chennai"
                user.pincode = "600001"
                user.phone = "9000000001"
            user.set_password(password)
            user.save()
        self._grant_admin_permissions()

    def _grant_admin_permissions(self):
        admin_user = User.objects.filter(username="admin").first()
        if not admin_user:
            return
        perms = Permission.objects.filter(
            content_type__app_label="shop",
            content_type__model__in=("product", "category", "order", "orderitem"),
        ).exclude(codename__startswith="delete_")
        admin_user.user_permissions.set(perms)

    def _settings(self):
        if not SiteSettings.objects.exists():
            SiteSettings.objects.create()

    def _categories(self):
        for cat in CATEGORIES:
            Category.objects.update_or_create(
                slug=cat["slug"],
                defaults={
                    "name": cat["name"],
                    "image": cat["image"],
                    "description": cat["description"],
                    "icon": cat["icon"],
                    "status": True,
                },
            )

    def _products(self):
        if Product.objects.count() >= 1000:
            return 0
        cats = {c.slug: c for c in Category.objects.all()}
        existing = set(Product.objects.values_list("sku", flat=True))
        rows = []
        for item in build_products():
            if item["sku"] in existing:
                continue
            category = cats[item.pop("category_slug")]
            rows.append(Product(category=category, **item))
        Product.objects.bulk_create(rows, batch_size=200)
        return len(rows)
