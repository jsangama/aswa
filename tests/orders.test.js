describe('orders module behavior', () => {
  test('cart totals use price times quantity', () => {
    const items = [
      { price: 12, quantity: 1 },
      { price: 16, quantity: 2 },
    ];

    const total = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    expect(total).toBe(44);
  });
});
