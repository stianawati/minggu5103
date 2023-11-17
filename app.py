from flask import Flask, request, render_template, jsonify
import html
from pymongo import MongoClient
from datetime import datetime
import os

from os.path import dirname, join
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

DB_HOST = os.environ.get("MONGODB_URL")
DB_NAME = os.environ.get("DB_NAME")

client = MongoClient(DB_HOST)
db = client[DB_NAME]

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

# Fungsi validasi ekstensi file gambar
def is_valid_image_file(filename):
    validationExtension = ['jpg', 'png', 'jpeg']
    fileExtension = filename.split('.')[-1].lower()
    return fileExtension in validationExtension

@app.route('/diary', methods=["POST"])
def posting():
    judul = html.escape(request.form['judul'])
    komentar = html.escape(request.form['komentar'])
    cardImage = request.files['gambarKartu']
    profile = request.files['profil']
    
    
    if not is_valid_image_file(cardImage.filename):
        return jsonify({
            'type': 'info',
            'msg': "Hanya File Gambar Yang Boleh Diupload"
        })
        
    if not is_valid_image_file(profile.filename):
        return jsonify({
            'type': 'info',
            'msg': "Hanya File Gambar Yang Boleh Diupload"
        })
        
    # membuat nama baru untuk file menggunakan format waktu
    currentDatetime = datetime.now()
    formatTime = currentDatetime.strftime('%d-%m-%y-%H-%M-%S')
    newCardName = f'card-{formatTime}.{cardImage.filename.split(".")[-1]}'
    newProfileName = f'profile-{formatTime}.{cardImage.filename.split(".")[-1]}'

    uploadTime = currentDatetime.strftime('%d-%m-%Y')

    
    # simpan file ke dalam folder img
    pathDestinationCard = f'static/img/card/{newCardName}'
    pathDestinationProfile = f'static/img/profile/{newProfileName}'

    cardImage.save(pathDestinationCard)
    profile.save(pathDestinationProfile)

    # memasukan data ke database
    result = db.diary1.insert_one({
        'judul': judul,
        'komentar': komentar,
        'cardImageName': newCardName,
        'profileImageName': newProfileName,
        'uploadTime': uploadTime
    })
    if result.inserted_id:
        return jsonify({
            'type': 'success',
            'msg': "Data Berhasil Ditambahkan"
        })
    else:
        return jsonify({'type': 'error',
            "msg":"Data Gagal Ditambahkan"
        })

@app.route('/diary', methods=["GET"])
def listing():
    data_list = list(db.diary1.find({}, {'_id': False}))
    return jsonify(data_list)
    
    
if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)