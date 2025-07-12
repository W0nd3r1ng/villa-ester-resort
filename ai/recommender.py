# recommender.py
# Placeholder for AI recommendation logic
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/recommend', methods=['GET'])
def recommend():
    # TODO: Replace with real AI logic
    return jsonify([
        {"label": "BEST VALUE", "title": "Deluxe Ocean View", "desc": "Enjoy panoramic ocean views with our AI-recommended package based on your preferences."},
        {"label": "SPECIAL OFFER", "title": "Garden Suite", "desc": "20% off for your selected dates with complimentary breakfast and spa access."},
        {"label": "POPULAR CHOICE", "title": "Family Villa", "desc": "Perfect for families with spacious accommodations and kid-friendly amenities."}
    ])

if __name__ == '__main__':
    app.run(port=5001) 