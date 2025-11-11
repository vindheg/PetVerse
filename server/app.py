from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# Allow local development
CORS(app, resources={r"/*": {"origins": "*"}})

# Database setup
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'pets.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Pet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    type = db.Column(db.String(30))
    age = db.Column(db.Integer)
    description = db.Column(db.String(200))
    adopted = db.Column(db.Boolean, default=False)
    image = db.Column(db.String(200))

class Adoption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(50))
    pet_id = db.Column(db.Integer, db.ForeignKey('pet.id'))
    pet_name = db.Column(db.String(50))

class CommunityPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(50))
    title = db.Column(db.String(200))
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.now())

class LostFoundReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(50))
    report_type = db.Column(db.String(10))
    pet_name = db.Column(db.String(50))
    pet_type = db.Column(db.String(30))
    breed = db.Column(db.String(50))
    color = db.Column(db.String(50))
    location = db.Column(db.String(200))
    date = db.Column(db.String(20))
    contact_phone = db.Column(db.String(20))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.now())

def init_sample_data():
    """Initialize sample pets"""
    try:
        pets = [
            Pet(name="Bruno", type="Dog", age=3, description="Friendly and loyal golden retriever who loves playing fetch", image="bruno.webp", adopted=False),
            Pet(name="Chintu", type="Cat", age=2, description="Playful and curious tabby cat who enjoys cuddles and chasing toys", image="chintu.webp", adopted=False),
            Pet(name="Coco", type="Bird", age=1, description="Talkative and cheerful parrot that loves to sing and mimic sounds", image="coco.webp", adopted=False),
            Pet(name="Rocky", type="Rabbit", age=1, description="Gentle rabbit who loves carrots and hopping around in the garden", image="rocky.webp", adopted=False),
            Pet(name="Tommy", type="Dog", age=4, description="Energetic and loving labrador, great with children and other pets", image="tommy.webp", adopted=False),
            Pet(name="Milo", type="Cat", age=3, description="Independent and sweet siamese cat who enjoys quiet evenings", image="milo.webp", adopted=False),
            Pet(name="Soni", type="Rabbit", age=2, description="Soft and cuddly dwarf rabbit, perfect for first-time pet owners", image="soni.webp", adopted=False)
        ]
        db.session.add_all(pets)
        db.session.commit()
        print("Sample pets added successfully")
    except Exception as e:
        print(f"Error adding sample data: {e}")

# Auto-create tables and sample data - FIXED for newer Flask versions
with app.app_context():
    try:
        db.create_all()
        # Add sample pets if database is empty
        if Pet.query.count() == 0:
            init_sample_data()
            print("Database initialized with sample data")
    except Exception as e:
        print(f"Database initialization error: {e}")

# Serve HTML files from root directory
@app.route('/')
def serve_index():
    return send_from_directory('../', 'index.html')

@app.route('/<page>')
def serve_pages(page):
    if page.endswith('.html'):
        return send_from_directory('../', page)
    return "Page not found", 404

# Serve CSS files
@app.route('/style.css')
def serve_css():
    return send_from_directory('../', 'style.css')

# Serve JS files
@app.route('/script.js')
def serve_js():
    return send_from_directory('../', 'script.js')

@app.route('/header.js')
def serve_header_js():
    return send_from_directory('../', 'header.js')

@app.route('/auth.js')
def serve_auth_js():
    return send_from_directory('../', 'auth.js')

@app.route('/translation.js')
def serve_translation_js():
    return send_from_directory('../', 'translation.js')

# Serve static images from server/static folder
@app.route('/static/images/<path:filename>')
def serve_static_images(filename):
    return send_from_directory('static/images', filename)

# API Routes
@app.route('/api/pets', methods=['GET'])
def get_pets():
    try:
        pets = Pet.query.filter_by(adopted=False).all()
        pet_list = [
            {
                "id": p.id, 
                "name": p.name, 
                "type": p.type, 
                "age": f"{p.age} years",
                "description": p.description, 
                "image": f"/static/images/{p.image}" if p.image else "/static/images/default-pet.jpg"
            }
            for p in pets
        ]
        return jsonify(pet_list)
    except Exception as e:
        print(f"Error in get_pets: {e}")
        return jsonify({"error": "Failed to load pets"}), 500

@app.route('/api/adopt', methods=['POST'])
def adopt_pet():
    try:
        data = request.get_json()
        pet_id = data.get("pet_id")
        user_name = data.get("user_name")

        if not user_name:
            return jsonify({"error": "Please login first"}), 403

        if not pet_id:
            return jsonify({"error": "Pet ID is required"}), 400

        pet = Pet.query.get(pet_id)
        if not pet:
            return jsonify({"error": "Pet not found"}), 404

        if pet.adopted:
            return jsonify({"error": "Pet already adopted"}), 400

        pet.adopted = True
        adoption = Adoption(
            user_name=user_name, 
            pet_id=pet.id, 
            pet_name=pet.name
        )
        
        db.session.add(adoption)
        db.session.commit()
        
        return jsonify({
            "message": f"Successfully adopted {pet.name}! Thank you for giving them a forever home!",
            "pet_name": pet.name,
            "user_name": user_name
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Adoption failed: {str(e)}"}), 500

@app.route('/api/adoptions', methods=['GET'])
def get_adoptions():
    try:
        user_name = request.args.get('user_name')
        
        if not user_name:
            return jsonify({"error": "Username is required"}), 400

        adoptions = Adoption.query.filter_by(user_name=user_name).all()
        
        adoption_list = []
        for adoption in adoptions:
            pet = Pet.query.get(adoption.pet_id)
            
            adoption_data = {
                "pet_name": adoption.pet_name,
                "user_name": adoption.user_name,
                "type": pet.type if pet else "Unknown",
                "age": f"{pet.age} years" if pet and pet.age else "Unknown",
                "description": pet.description if pet else "Loved and cared for",
                "image": f"/static/images/{pet.image}" if pet and pet.image else "/static/images/default-pet.jpg"
            }
            adoption_list.append(adoption_data)

        return jsonify(adoption_list)

    except Exception as e:
        return jsonify({"error": f"Failed to fetch adoptions: {str(e)}"}), 500

@app.route('/api/reset', methods=['POST'])
def reset_database():
    try:
        Adoption.query.delete()
        pets = Pet.query.all()
        for pet in pets:
            pet.adopted = False
        db.session.commit()
        return jsonify({
            "message": "Database reset successfully! All pets are available for adoption again.",
            "pets_reset": len(pets)
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Reset failed: {str(e)}"}), 500

@app.route('/api/community/posts', methods=['GET', 'POST'])
def community_posts():
    if request.method == 'POST':
        data = request.get_json()
        post = CommunityPost(
            user_name=data.get('user_name'),
            title=data.get('title'),
            content=data.get('content')
        )
        db.session.add(post)
        db.session.commit()
        return jsonify({"message": "Post created successfully"})
    
    posts = CommunityPost.query.order_by(CommunityPost.created_at.desc()).all()
    post_list = [
        {
            "id": p.id,
            "user_name": p.user_name,
            "title": p.title,
            "content": p.content,
            "created_at": p.created_at.isoformat()
        }
        for p in posts
    ]
    return jsonify(post_list)

@app.route('/api/lost-found/reports', methods=['GET', 'POST'])
def lost_found_reports():
    if request.method == 'POST':
        data = request.get_json()
        report = LostFoundReport(
            user_name=data.get('user_name'),
            report_type=data.get('report_type'),
            pet_name=data.get('pet_name'),
            pet_type=data.get('pet_type'),
            breed=data.get('breed'),
            color=data.get('color'),
            location=data.get('location'),
            date=data.get('date'),
            contact_phone=data.get('contact_phone'),
            description=data.get('description')
        )
        db.session.add(report)
        db.session.commit()
        return jsonify({"message": "Report submitted successfully"})
    
    reports = LostFoundReport.query.order_by(LostFoundReport.created_at.desc()).all()
    report_list = [
        {
            "id": r.id,
            "user_name": r.user_name,
            "report_type": r.report_type,
            "pet_name": r.pet_name,
            "pet_type": r.pet_type,
            "breed": r.breed,
            "color": r.color,
            "location": r.location,
            "date": r.date,
            "contact_phone": r.contact_phone,
            "description": r.description,
            "created_at": r.created_at.isoformat()
        }
        for r in reports
    ]
    return jsonify(report_list)

# Additional pages
@app.route('/volunteer')
def volunteer_page():
    return send_from_directory('../', 'volunteer.html')

@app.route('/donate')
def donate_page():
    return send_from_directory('../', 'donate.html')

@app.route('/api/init', methods=['GET'])
def init_data():
    try:
        db.create_all()
        Pet.query.delete()
        Adoption.query.delete()
        db.session.commit()

        init_sample_data()
        
        pet_count = Pet.query.count()
        return jsonify({
            "message": "Database initialized successfully!",
            "pets_added": pet_count
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Initialization failed: {str(e)}"}), 500

@app.route('/api/health')
def api_health():
    try:
        pet_count = Pet.query.count()
        return jsonify({
            "status": "healthy",
            "database": "working", 
            "total_pets": pet_count,
            "message": f"API is running with {pet_count} pets in database"
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Production configuration
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)