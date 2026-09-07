from django.db.models import Sum
from .models import CartItem, Category, SiteSettings, WishlistItem


def store(request):
    site = SiteSettings.objects.first()
    if not site:
        site = SiteSettings(
            store_name="Bigdots",
            email="kumareshtfc@gmail.com",
            phone="+916379149227",
            website="https://www.decathlon.in/",
            address="Chennai, Tamil Nadu",
            whatsapp="916379149227",
        )
    phone = site.phone or "+916379149227"
    email = site.email or "kumareshtfc@gmail.com"
    whatsapp = "".join(ch for ch in (site.whatsapp or phone) if ch.isdigit())
    cart_count = 0
    wish_count = 0
    loved_ids = set()
    if getattr(request, "user", None) and request.user.is_authenticated:
        cart_count = CartItem.objects.filter(user=request.user).aggregate(v=Sum("quantity"))["v"] or 0
        wish_count = WishlistItem.objects.filter(user=request.user).count()
        loved_ids = set(WishlistItem.objects.filter(user=request.user).values_list("product_id", flat=True))
    return {
        "site": site,
        "categories": Category.objects.filter(status=True).order_by("name"),
        "cart_count": cart_count,
        "wish_count": wish_count,
        "loved_ids": loved_ids,
        "tel_href": f"tel:+{''.join(ch for ch in phone if ch.isdigit())}",
        "mail_href": (
            "https://mail.google.com/mail/?view=cm&fs=1&to="
            f"{email}&su=Bigdots%20enquiry"
        ),
        "web_href": site.website or "https://www.decathlon.in/",
        "wa_href": f"https://wa.me/{whatsapp}",
    }
