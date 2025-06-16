import asyncHandler from 'express-async-handler';

export const getAvailableMeat = asyncHandler(async (req, res) => {
  const meat = [
    { _id: '1', name: 'Beef', price: 450, stock: 80, slaughterhouse: 'Prime Slaughterhouse' },
    { _id: '2', name: 'Goat', price: 500, stock: 50, slaughterhouse: 'Green Hills Meats' },
  ];

  res.json({ meat });
});
