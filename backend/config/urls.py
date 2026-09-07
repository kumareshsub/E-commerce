from django.contrib import admin
from django.urls import include, path

from shop import web_views

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("login/", web_views.login_page, name="login"),
    path("login", web_views.login_page),
    path("register/", web_views.register_page, name="register"),
    path("register", web_views.register_page),
    path("logout/", web_views.logout_page, name="logout"),
    path("logout", web_views.logout_page),
    path("shop/", web_views.shop, name="shop"),
    path("shop/<slug:slug>/", web_views.shop, name="shop_category"),
    path("product/<str:slug>/", web_views.product_detail, name="product_detail"),
    path("contact/", web_views.contact, name="contact"),
    path("contact", web_views.contact),
    path("cart/", web_views.cart, name="cart"),
    path("cart/add/<int:product_id>/", web_views.cart_add, name="cart_add"),
    path("cart/<int:item_id>/update/", web_views.cart_update, name="cart_update"),
    path("cart/<int:item_id>/remove/", web_views.cart_remove, name="cart_remove"),
    path("wishlist/", web_views.wishlist, name="wishlist"),
    path("wishlist/toggle/<int:product_id>/", web_views.wishlist_toggle, name="wishlist_toggle"),
    path("checkout/", web_views.checkout, name="checkout"),
    path("orders/", web_views.orders, name="orders"),
    path("account/", web_views.account, name="account"),
    path("api/", include("shop.urls")),
    path("", web_views.home, name="home"),
]
