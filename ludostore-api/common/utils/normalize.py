def normalize_phone(phone: str) -> str:
    """
    Normalize to international format for Hubtel.
        0244123456    => 233244123456
        +233244123456 => 233244123456
        233244123456  => 233244123456
    """
    phone = str(phone).strip().replace(" ", "").replace("-", "")
    if phone.startswith("+"):
        return phone[1:]
    if phone.startswith("0"):
        return "233" + phone[1:]
    return phone
