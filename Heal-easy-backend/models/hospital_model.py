from decimal import Decimal

def hospital_key(hospital_id: str) -> dict:
    return {
        "PK": f"HOSPITAL#{hospital_id}",
        "SK": "METADATA",
    }


def build_hospital_item(
    hospital_id: str,
    name: str,
    image: str,
    alt: str,
    badge: dict,
    meta_dashboard: str,
    meta_search: str,
    rating: float,
    chips: list,
    chips_full: list,
    full_name: str = None,
) -> dict:

    item = {
        **hospital_key(hospital_id),
        "name": name,
        "fullName": full_name or name,
        "image": image,
        "alt": alt,
        "badge": badge,
        "metaDashboard": meta_dashboard,
        "metaSearch": meta_search,
        "rating": Decimal(str(rating)),
        "chips": chips,
        "chipsFull": chips_full,
    }

    return item