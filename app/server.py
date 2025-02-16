from flask import Flask, send_file
from PIL import Image
import io

app = Flask(__name__)

@app.route('/image', methods=['GET'])
def get_image():
    # Create a simple colored image
    img = Image.new('RGB', (100, 100), color='red')
    
    # Save it to a bytes buffer
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    return send_file(img_io, mimetype='image/png')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)