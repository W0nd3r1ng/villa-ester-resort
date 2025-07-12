exports.getAllRooms = (req, res) => {
  // TODO: Fetch rooms from DB
  res.json([
    { id: 1, name: 'Deluxe Ocean View' },
    { id: 2, name: 'Garden Suite' },
    { id: 3, name: 'Family Villa' }
  ]);
}; 