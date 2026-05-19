from decimal import Decimal

from django.test import TestCase

from .models import Product


class ProductStockStatusTests(TestCase):
    def make_product(self, **overrides):
        data = {
            "name": "Gallery Piece",
            "description": "A framed artwork.",
            "regular_price": Decimal("100.00"),
            "sku": "ART-001",
            "stock_quantity": 0,
            "stock_status": Product.StockStatus.OUT_OF_STOCK,
        }
        data.update(overrides)
        return Product.objects.create(**data)

    def test_positive_stock_cannot_be_created_as_out_of_stock(self):
        product = self.make_product(
            sku="ART-002",
            stock_quantity=5,
            stock_status=Product.StockStatus.OUT_OF_STOCK,
        )

        self.assertEqual(product.stock_status, Product.StockStatus.IN_STOCK)

    def test_stock_quantity_update_persists_matching_stock_status(self):
        product = self.make_product(sku="ART-003")

        product.stock_quantity = 3
        product.save(update_fields=["stock_quantity"])
        product.refresh_from_db()

        self.assertEqual(product.stock_status, Product.StockStatus.IN_STOCK)

    def test_zero_stock_cannot_remain_in_stock(self):
        product = self.make_product(
            sku="ART-004",
            stock_quantity=0,
            stock_status=Product.StockStatus.IN_STOCK,
        )

        self.assertEqual(product.stock_status, Product.StockStatus.OUT_OF_STOCK)
