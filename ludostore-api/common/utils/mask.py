def mask_email(email: str) -> str:
    if not email or "@" not in email:
        return email
    local, domain = email.split("@", 1)
    visible = local[:2] if len(local) >= 2 else local[0]
    return visible + "*" * (len(local) - len(visible)) + "@" + domain


def mask_phone(phone: str) -> str:
    phone = str(phone).strip()
    if len(phone) <= 4:
        return phone
    return "*" * len(phone[:-4]) + phone[-4:]
