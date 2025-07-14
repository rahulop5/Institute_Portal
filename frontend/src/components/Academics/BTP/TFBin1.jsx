const temp={
    "email": "vihaan.isha1@example.com",
    "phase": "TF",
    "inteam": 2,
    "bin": 1,
    "message": "Full team",
    "team": {
        "_id": "686ea21605c14e3f3d14957d",
        "bin1": {
            "email": "vihaan.isha1@example.com",
            "name": "Vihaan Isha",
            "approved": true
        },
        "bin2": {
            "email": "vivaan.sneha21@example.com",
            "name": "Vivaan Sneha",
            "approved": true
        },
        "bin3": {
            "email": "diya.sai38@example.com",
            "name": "Diya Sai",
            "approved": true
        }
    }
}

const temp2={
    "email": "neha.saanvi9@example.com",
    "phase": "TF",
    "inteam": 0,
    "bin": 1,
    "message": "You are currently not in any full or partial team. Form a team",
    "availablebin2": [
        {
            "name": "Kabir Neha",
            "rollno": "S20211028",
            "email": "kabir.neha28@example.com"
        },
        {
            "name": "Dev Yash",
            "rollno": "S20211036",
            "email": "dev.yash36@example.com"
        },
        {
            "name": "Saanvi Anaya",
            "rollno": "S20211037",
            "email": "saanvi.anaya37@example.com"
        }
    ],
    "availablebin3": [
        {
            "name": "Meera Ira",
            "rollno": "S20211043",
            "email": "meera.ira43@example.com"
        },
        {
            "name": "Divya Anika",
            "rollno": "S20211045",
            "email": "divya.anika45@example.com"
        },
        {
            "name": "Neha Dev",
            "rollno": "S20211046",
            "email": "neha.dev46@example.com"
        },
        {
            "name": "Anika Ira",
            "rollno": "S20211049",
            "email": "anika.ira49@example.com"
        }
    ]
}

export default function TFBin1({data}){
    switch (data.inteam) {
        case 0:
            
            break;
        case 1: 
            break;

        default:
            break;
    }
    return (
        <h1>bin 1 team formation</h1>
    );
}