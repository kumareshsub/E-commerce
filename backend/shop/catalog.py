import json
import random

IMG = "https://images.unsplash.com"

CATEGORIES = [
    {
        "name": "Running",
        "slug": "running",
        "icon": "run",
        "image": f"{IMG}/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
        "description": "Shoes, apparel and accessories for every kilometre.",
        "brands": ["Kalenji", "Nike", "Adidas", "Asics", "Puma"],
        "images": [
            f"{IMG}/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
        ],
        "types": [
            ("Running Shoes", (32, 12, 11, 280), "Mesh + EVA foam", ["UK6", "UK7", "UK8", "UK9", "UK10"], "Road running and daily 5K training."),
            ("Trail Shoes", (33, 12.5, 12, 320), "Ripstop mesh + rubber", ["UK6", "UK7", "UK8", "UK9"], "Grip for mixed trails and monsoon paths."),
            ("Running T-Shirt", (70, 50, 2, 140), "Polyester dry-fit", ["S", "M", "L", "XL"], "Sweat-wicking tee for interval sessions."),
            ("Running Shorts", (40, 32, 3, 120), "Polyester + brief", ["S", "M", "L", "XL"], "Split shorts with zip pocket for keys."),
            ("Calf Socks Pack", (22, 10, 3, 80), "Nylon + spandex", ["S", "M", "L"], "Cushioned socks sold as a pair pack."),
        ],
        "features": ["Breathable upper", "Lightweight build", "Quick-dry fabric", "Reflective hits", "Secure lace lock"],
        "suitable": "Road running and tempo training",
        "care": "Hand wash cold. Do not tumble dry.",
    },
    {
        "name": "Football",
        "slug": "football",
        "icon": "football",
        "image": f"{IMG}/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
        "description": "Boots, balls and kits built for the pitch.",
        "brands": ["Kipsta", "Nike", "Adidas", "Puma", "Nivia"],
        "images": [
            f"{IMG}/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1614632537190-23e4146777db?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
        ],
        "types": [
            ("FG Football Boots", (31, 11, 12, 260), "PU + TPU studs", ["UK6", "UK7", "UK8", "UK9"], "Firm-ground boots for natural grass."),
            ("Match Football Size 5", (22, 22, 22, 430), "Thermally bonded PU", ["5"], "FIFA-quality flight for club matches."),
            ("Training Jersey", (72, 52, 2, 160), "Polyester mesh", ["S", "M", "L", "XL"], "Club training jersey with moisture control."),
            ("Shin Guards", (22, 10, 3, 180), "EVA + PE shell", ["S", "M", "L"], "Ankle-strap guards for academy play."),
            ("Goalkeeper Gloves", (28, 12, 8, 240), "Latex palm", ["7", "8", "9", "10"], "Finger-save gloves for shot stopping."),
        ],
        "features": ["High-grip sole", "Padded strike zone", "Machine-wash kit", "Match durability", "Secure fit"],
        "suitable": "11-a-side and turf training",
        "care": "Wipe clean after use. Air dry away from sun.",
    },
    {
        "name": "Cricket",
        "slug": "cricket",
        "icon": "cricket",
        "image": f"{IMG}/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80",
        "description": "Bats, pads and gear for nets and match day.",
        "brands": ["GM", "SS", "SG", "MRF", "Alcis"],
        "images": [
            f"{IMG}/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1593766788306-285e890686d7?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=900&q=80",
        ],
        "types": [
            ("Kashmir Willow Bat", (86, 11, 6, 1180), "Kashmir willow", ["SH", "Harrow"], "Mid-blade profile for club cricket."),
            ("Leather Cricket Ball", (7.2, 7.2, 7.2, 160), "Four-piece leather", ["Senior"], "Red leather ball for turf nets."),
            ("Batting Gloves", (28, 14, 8, 320), "Leather + foam", ["RH Adult", "LH Adult"], "Multi-flex gloves with extra finger bars."),
            ("Batting Pads", (70, 22, 12, 980), "Cane + cotton", ["Adult", "Youth"], "Lightweight pads with instep protection."),
            ("Replica Jersey", (74, 54, 2, 170), "Dry-fit polyester", ["S", "M", "L", "XL"], "Match replica jersey for fans and nets."),
        ],
        "features": ["Match-ready build", "Shock absorption", "Toe guard", "Sweatband grip", "Club approved"],
        "suitable": "Nets, school and club matches",
        "care": "Oil the bat face lightly. Keep leather dry.",
    },
    {
        "name": "Fitness",
        "slug": "fitness",
        "icon": "fitness",
        "image": f"{IMG}/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
        "description": "Home gym, strength and cardio essentials.",
        "brands": ["Domyos", "Cultsport", "Decathlon", "Kore", "Protoner"],
        "images": [
            f"{IMG}/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1598289431512-b97e46d1d738?auto=format&fit=crop&w=900&q=80",
        ],
        "types": [
            ("Hex Dumbbell", (18, 18, 18, 5000), "Cast iron + rubber", ["5kg", "7.5kg", "10kg"], "Hex head dumbbell for home strength work."),
            ("Yoga Mat 8mm", (183, 61, 0.8, 1200), "NBR foam", ["Standard"], "Cushioned mat with alignment marks."),
            ("Resistance Band", (100, 5, 0.5, 90), "Natural latex", ["Light", "Medium", "Heavy"], "Loop band for mobility and glutes."),
            ("Skipping Rope", (280, 3, 3, 180), "PVC + PP handles", ["Adjustable"], "Ball-bearing rope for cardio bursts."),
            ("Gym Gloves", (22, 12, 3, 110), "Mesh + leatherette", ["S", "M", "L"], "Palm-padded gloves for pull days."),
        ],
        "features": ["Home-gym ready", "Non-slip base", "Easy storage", "Beginner friendly", "Durable coating"],
        "suitable": "Home workouts and studio classes",
        "care": "Wipe with a damp cloth. Store flat or hung.",
    },
    {
        "name": "Cycling",
        "slug": "cycling",
        "icon": "cycle",
        "image": f"{IMG}/photo-1485965120184-e7b60b01cc3d?auto=format&fit=crop&w=900&q=80",
        "description": "Bikes, helmets and riding apparel.",
        "brands": ["Rockrider", "Btwin", "Van Rysel", "Firefox", "Hero"],
        "images": [
            f"{IMG}/photo-1485965120184-e7b60b01cc3d?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1557683316-973673baf926?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80",
        ],
        "types": [
            ("MTB Helmet", (28, 22, 18, 320), "EPS + PC shell", ["M", "L"], "In-mould helmet with 18 vents."),
            ("Cycling Jersey", (70, 50, 2, 150), "Polyester mesh", ["S", "M", "L", "XL"], "Race-cut jersey with three rear pockets."),
            ("Cycling Gloves", (20, 11, 3, 70), "Gel + mesh", ["S", "M", "L"], "Padded palm gloves for long rides."),
            ("Frame Bag", (30, 12, 12, 220), "Ripstop nylon", ["One size"], "Waterproof bag for tools and tubes."),
            ("LED Light Set", (8, 5, 4, 90), "ABS + LED", ["USB"], "Front and rear USB rechargeable lights."),
        ],
        "features": ["Road tested", "Reflective piping", "Tool-free fit", "Weather resistant", "Lightweight"],
        "suitable": "City commute and weekend trails",
        "care": "Rinse mud off. Charge lights fully before rides.",
    },
    {
        "name": "Swimming",
        "slug": "swimming",
        "icon": "swim",
        "image": f"{IMG}/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=900&q=80",
        "description": "Goggles, caps and pool-ready gear.",
        "brands": ["Nabaiji", "Speedo", "Arena", "Tyr", "Zoggs"],
        "images": [
            f"{IMG}/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1560090995-01632a28895b?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80",
        ],
        "types": [
            ("Swim Goggles", (17, 7, 5, 45), "PC lens + silicone", ["Adult"], "Anti-fog goggles with soft gasket."),
            ("Silicone Cap", (22, 16, 2, 55), "100% silicone", ["Adult"], "Durable cap that stays put in drills."),
            ("Swim Shorts", (40, 32, 3, 160), "Polyester quick-dry", ["S", "M", "L", "XL"], "Inner mesh shorts with drawcord."),
            ("Kickboard", (42, 27, 3, 280), "EVA foam", ["Standard"], "Training kickboard for leg sets."),
            ("Swim Fins", (42, 18, 8, 520), "Rubber", ["UK6", "UK7", "UK8", "UK9"], "Short fins for technique work."),
        ],
        "features": ["Chlorine resistant", "Anti-fog coating", "UV protection", "Quick dry", "Secure strap"],
        "suitable": "Pool training and open-water warm-up",
        "care": "Rinse in fresh water after every swim.",
    },
    {
        "name": "Outdoor",
        "slug": "outdoor",
        "icon": "outdoor",
        "image": f"{IMG}/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80",
        "description": "Hiking, camping and trail adventure kit.",
        "brands": ["Quechua", "Wildcraft", "Forclaz", "Coleman", "Decathlon"],
        "images": [
            f"{IMG}/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=900&q=80",
        ],
        "types": [
            ("2-Person Tent", (210, 140, 110, 2600), "Polyester 2000mm", ["2P"], "Freestanding dome tent for weekend camps."),
            ("30L Hiking Backpack", (52, 30, 22, 780), "Polyester 600D", ["30L"], "Daypack with rain cover and hydration sleeve."),
            ("Hiking Shoes", (32, 12, 13, 420), "Suede + membrane", ["UK7", "UK8", "UK9", "UK10"], "Waterproof shoes for monsoon trails."),
            ("Trekking Poles", (120, 5, 5, 480), "Aluminium 7075", ["Pair"], "Foldable poles with tungsten tip."),
            ("Sleeping Bag", (210, 75, 8, 1100), "Hollowfibre + polyester", ["0°C"], "Envelope bag for 3-season camping."),
        ],
        "features": ["Weather sealed", "Packable design", "High-visibility zip", "Reinforced base", "Trail tested"],
        "suitable": "Overnight treks and hill weekends",
        "care": "Dry fully before packing. Reproof flysheet yearly.",
    },
    {
        "name": "Sportswear",
        "slug": "sportswear",
        "icon": "wear",
        "image": f"{IMG}/photo-1515886657613-9f3515e0c265?auto=format&fit=crop&w=900&q=80",
        "description": "Jerseys, jackets and everyday athletic wear.",
        "brands": ["Domyos", "Alcis", "HRX", "Puma", "Adidas"],
        "images": [
            f"{IMG}/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1515886657613-9f3515e0c265?auto=format&fit=crop&w=900&q=80",
            f"{IMG}/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
        ],
        "types": [
            ("Training Hoodie", (72, 58, 4, 420), "Cotton fleece", ["S", "M", "L", "XL"], "Soft hoodie for warm-up and commute."),
            ("Training Leggings", (95, 32, 2, 240), "Nylon-spandex", ["S", "M", "L"], "High-waist compressive tights."),
            ("Sports Jacket", (74, 56, 4, 380), "Ripstop + mesh", ["S", "M", "L", "XL"], "Packable wind shell with taped seams."),
            ("Sports Cap", (28, 18, 12, 90), "Polyester twill", ["Free size"], "Curved brim cap with sweatband."),
            ("Track Pants", (104, 38, 3, 320), "Polyester knit", ["S", "M", "L", "XL"], "Tapered pants with zip pockets."),
        ],
        "features": ["All-day comfort", "4-way stretch", "Anti-odour finish", "Secure pockets", "Athletic fit"],
        "suitable": "Training, travel and daily wear",
        "care": "Machine wash cold with like colours.",
    },
]

COLORS = ["Black", "Navy", "White", "Red", "Olive", "Grey"]
GENDERS = ["unisex", "men", "women"]


def build_products():
    rng = random.Random(42)
    products = []
    sku_n = 1
    for cat in CATEGORIES:
        for type_name, dims, material, sizes, blurb in cat["types"]:
            for color in COLORS:
                for variant in range(5):
                    size = sizes[variant % len(sizes)]
                    brand = rng.choice(cat["brands"])
                    length, width, height, weight = dims
                    weight = int(weight * rng.uniform(0.92, 1.08))
                    mrp = rng.choice([799, 999, 1299, 1499, 1999, 2499, 2999, 3499, 3999, 4499, 5499])
                    if "Bike" in type_name or "Tent" in type_name:
                        mrp = rng.choice([5499, 7999, 9999, 14999, 18999])
                    price = int(mrp * rng.uniform(0.62, 0.82))
                    model = 100 + variant * 17 + rng.randint(0, 8)
                    name = f"{brand} {type_name} {model} {color} {size}"
                    slug = (
                        f"{brand}-{type_name}-{model}-{color}-{size}-{sku_n}"
                        .lower()
                        .replace(" ", "-")
                        .replace("°", "")
                    )
                    sku = f"BD-{cat['slug'][:3].upper()}-{sku_n:04d}"
                    features = rng.sample(cat["features"], k=min(4, len(cat["features"])))
                    description = (
                        f"{name} is built for {cat['suitable'].lower()} {blurb} "
                        f"Packed size/body measures {length} × {width} × {height} cm and weighs about {weight} g. "
                        f"Colour: {color}. Size: {size}. Material: {material}."
                    )
                    products.append(
                        {
                            "category_slug": cat["slug"],
                            "name": name[:220],
                            "slug": slug[:240],
                            "sku": sku,
                            "brand": brand,
                            "image": rng.choice(cat["images"]),
                            "quantity": rng.randint(8, 80),
                            "original_price": float(mrp),
                            "selling_price": float(price),
                            "description": description,
                            "trending": rng.random() < 0.08,
                            "rating": round(rng.uniform(3.9, 4.9), 1),
                            "reviews_count": rng.randint(40, 3200),
                            "length_cm": float(length),
                            "width_cm": float(width),
                            "height_cm": float(height),
                            "weight_g": weight,
                            "material": material,
                            "color": color,
                            "size": size,
                            "gender": rng.choice(GENDERS),
                            "features": json.dumps(features),
                            "highlights": f"{color} | Size {size} | {material}",
                            "warranty_months": rng.choice([3, 6, 12, 24]),
                            "country_of_origin": rng.choice(["India", "Vietnam", "China", "Indonesia"]),
                            "care_instructions": cat["care"],
                            "suitable_for": cat["suitable"],
                            "status": True,
                        }
                    )
                    sku_n += 1
    return products
