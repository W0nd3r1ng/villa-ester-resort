exports.getRecommendations = (req, res) => {
  // TODO: Integrate with AI service
  res.json([
    { label: 'BEST VALUE', title: 'Deluxe Ocean View', desc: 'Enjoy panoramic ocean views with our AI-recommended package based on your preferences.' },
    { label: 'SPECIAL OFFER', title: 'Garden Suite', desc: '20% off for your selected dates with complimentary breakfast and spa access.' },
    { label: 'POPULAR CHOICE', title: 'Family Villa', desc: 'Perfect for families with spacious accommodations and kid-friendly amenities.' }
  ]);
}; 