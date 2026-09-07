# Bigdots

Django REST + React sports store with 1000+ products (dimensions, materials, colours, sizes and features).

## Logins

| Role | Username | Password | Access |
|---|---|---|---|
| Super admin | `superadmin` | `SuperAdmin@123` | Users, refunds, settings, delete catalogue |
| Admin | `admin` | `Admin@123` | Products, categories, order fulfilment |
| Customer | `demo` | `Demo@123` | Shop, cart, checkout |

## Super admin vs admin

**Store admin** can add/edit products and categories, update order status, mark COD as paid, and call/email customers.

**Super admin** can do all of that plus manage staff, delete catalogue items, refund payments, and change Call / Email / Website links.

## Run

```bash
cd backend
.\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_catalog
python manage.py runserver 8000
```

```bash
cd frontend
npm run dev
```

Open http://localhost:5173

Django admin: http://127.0.0.1:8000/django-admin/

## Seed data

`python manage.py seed_catalog` creates the default accounts and more than 1000 sports products with SKU, dimensions, weight, material, colour, size, warranty and care instructions.
