"""
Database seeding script for Voice2Gov
Populates the database with Nigerian states, LGAs, and representatives
"""

from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models.representative import Representative, ContactInfo, State, Lga, Chamber, ContactType
from .models.user import User
from .models.legal_document import LegalDocument

# Nigerian States and their codes
NIGERIAN_STATES = [
    {"name": "Abia", "code": "AB", "region": "South East", "capital": "Umuahia"},
    {"name": "Adamawa", "code": "AD", "region": "North East", "capital": "Yola"},
    {"name": "Akwa Ibom", "code": "AK", "region": "South South", "capital": "Uyo"},
    {"name": "Anambra", "code": "AN", "region": "South East", "capital": "Awka"},
    {"name": "Bauchi", "code": "BA", "region": "North East", "capital": "Bauchi"},
    {"name": "Bayelsa", "code": "BY", "region": "South South", "capital": "Yenagoa"},
    {"name": "Benue", "code": "BE", "region": "North Central", "capital": "Makurdi"},
    {"name": "Borno", "code": "BO", "region": "North East", "capital": "Maiduguri"},
    {"name": "Cross River", "code": "CR", "region": "South South", "capital": "Calabar"},
    {"name": "Delta", "code": "DE", "region": "South South", "capital": "Asaba"},
    {"name": "Ebonyi", "code": "EB", "region": "South East", "capital": "Abakaliki"},
    {"name": "Edo", "code": "ED", "region": "South South", "capital": "Benin City"},
    {"name": "Ekiti", "code": "EK", "region": "South West", "capital": "Ado-Ekiti"},
    {"name": "Enugu", "code": "EN", "region": "South East", "capital": "Enugu"},
    {"name": "FCT", "code": "FC", "region": "North Central", "capital": "Abuja"},
    {"name": "Gombe", "code": "GO", "region": "North East", "capital": "Gombe"},
    {"name": "Imo", "code": "IM", "region": "South East", "capital": "Owerri"},
    {"name": "Jigawa", "code": "JI", "region": "North West", "capital": "Dutse"},
    {"name": "Kaduna", "code": "KD", "region": "North West", "capital": "Kaduna"},
    {"name": "Kano", "code": "KN", "region": "North West", "capital": "Kano"},
    {"name": "Katsina", "code": "KT", "region": "North West", "capital": "Katsina"},
    {"name": "Kebbi", "code": "KE", "region": "North West", "capital": "Birnin Kebbi"},
    {"name": "Kogi", "code": "KO", "region": "North Central", "capital": "Lokoja"},
    {"name": "Kwara", "code": "KW", "region": "North Central", "capital": "Ilorin"},
    {"name": "Lagos", "code": "LA", "region": "South West", "capital": "Ikeja"},
    {"name": "Nasarawa", "code": "NA", "region": "North Central", "capital": "Lafia"},
    {"name": "Niger", "code": "NI", "region": "North Central", "capital": "Minna"},
    {"name": "Ogun", "code": "OG", "region": "South West", "capital": "Abeokuta"},
    {"name": "Ondo", "code": "ON", "region": "South West", "capital": "Akure"},
    {"name": "Osun", "code": "OS", "region": "South West", "capital": "Osogbo"},
    {"name": "Oyo", "code": "OY", "region": "South West", "capital": "Ibadan"},
    {"name": "Plateau", "code": "PL", "region": "North Central", "capital": "Jos"},
    {"name": "Rivers", "code": "RI", "region": "South South", "capital": "Port Harcourt"},
    {"name": "Sokoto", "code": "SO", "region": "North West", "capital": "Sokoto"},
    {"name": "Taraba", "code": "TA", "region": "North East", "capital": "Jalingo"},
    {"name": "Yobe", "code": "YO", "region": "North East", "capital": "Damaturu"},
    {"name": "Zamfara", "code": "ZA", "region": "North West", "capital": "Gusau"},
]

# Sample LGAs by state (subset for demonstration)
SAMPLE_LGAS = {
    "Lagos": ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", 
              "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", 
              "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", 
              "Shomolu", "Surulere"],
    "Kano": ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta",
             "Dawakin Kudu", "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa", "Garko", 
             "Garun Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo", "Kano Municipal",
             "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda",
             "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shanono", "Sumaila",
             "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"],
    "Rivers": ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru",
               "Bonny", "Degema", "Eleme", "Emohua", "Etche", "Gokana", "Ikwerre", "Khana",
               "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro",
               "Oyigbo", "Port Harcourt", "Tai"],
    "FCT": ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"],
}

# Sample Senators (10th Assembly)
SENATORS = [
    {"name": "Godswill Akpabio", "title": "Senator", "state": "Akwa Ibom", "district": "Akwa Ibom North West", "party": "APC", "bio": "President of the Senate, 10th National Assembly. Former Governor of Akwa Ibom State."},
    {"name": "Barau Jibrin", "title": "Senator", "state": "Kano", "district": "Kano North", "party": "APC", "bio": "Deputy President of the Senate, 10th National Assembly."},
    {"name": "Solomon Adeola", "title": "Senator", "state": "Lagos", "district": "Lagos West", "party": "APC", "bio": "Chairman, Senate Committee on Finance."},
    {"name": "Adams Oshiomhole", "title": "Senator", "state": "Edo", "district": "Edo North", "party": "APC", "bio": "Former Governor of Edo State, former National Chairman of APC."},
    {"name": "Abba Moro", "title": "Senator", "state": "Benue", "district": "Benue South", "party": "PDP", "bio": "Senate Minority Leader."},
    {"name": "Ali Ndume", "title": "Senator", "state": "Borno", "district": "Borno South", "party": "APC", "bio": "Former Senate Leader."},
    {"name": "Orji Uzor Kalu", "title": "Senator", "state": "Abia", "district": "Abia North", "party": "APC", "bio": "Chief Whip of the Senate. Former Governor of Abia State."},
    {"name": "Oluremi Tinubu", "title": "Senator", "state": "Lagos", "district": "Lagos Central", "party": "APC", "bio": "First Lady of Nigeria."},
    {"name": "Tokunbo Abiru", "title": "Senator", "state": "Lagos", "district": "Lagos East", "party": "APC", "bio": "Former MD of Polaris Bank."},
    {"name": "Seriake Dickson", "title": "Senator", "state": "Bayelsa", "district": "Bayelsa West", "party": "PDP", "bio": "Former Governor of Bayelsa State."},
]

# Sample House of Reps members
HOUSE_REPS = [
    {"name": "Tajudeen Abbas", "title": "Rt. Hon.", "state": "Kaduna", "constituency": "Zaria Federal Constituency", "party": "APC", "bio": "Speaker of the House of Representatives, 10th National Assembly."},
    {"name": "Benjamin Kalu", "title": "Hon.", "state": "Abia", "constituency": "Bende Federal Constituency", "party": "APC", "bio": "Deputy Speaker of the House of Representatives."},
    {"name": "Kingsley Chinda", "title": "Hon.", "state": "Rivers", "constituency": "Obio/Akpor Federal Constituency", "party": "PDP", "bio": "House Minority Leader."},
    {"name": "Julius Ihonvbere", "title": "Hon.", "state": "Edo", "constituency": "Owan East/Owan West Federal Constituency", "party": "APC", "bio": "House Majority Leader."},
    {"name": "Akin Alabi", "title": "Hon.", "state": "Oyo", "constituency": "Egbeda/Ona Ara Federal Constituency", "party": "APC", "bio": "Chairman, House Committee on Sports."},
]

# Sample LGA Chairmen
LGA_CHAIRMEN = [
    {"name": "Mojeed Balogun", "title": "Hon. Chairman", "state": "Lagos", "lga": "Ikeja", "party": "APC", "bio": "Chairman of Ikeja Local Government Area."},
    {"name": "Jelili Sulaimon", "title": "Hon. Chairman", "state": "Lagos", "lga": "Alimosho", "party": "APC", "bio": "Chairman of Alimosho Local Government Area, the most populous LGA in Nigeria."},
    {"name": "Ibrahim Ungogo", "title": "Hon. Chairman", "state": "Kano", "lga": "Ungogo", "party": "NNPP", "bio": "Chairman of Ungogo Local Government Area."},
    {"name": "George Ariolu", "title": "Hon. Chairman", "state": "Rivers", "lga": "Obio/Akpor", "party": "PDP", "bio": "Chairman of Obio/Akpor Local Government Area."},
]


def seed_states(db: Session):
    """Seed Nigerian states"""
    print("Seeding states...")
    for state_data in NIGERIAN_STATES:
        existing = db.query(State).filter(State.code == state_data["code"]).first()
        if not existing:
            state = State(**state_data)
            db.add(state)
    db.commit()
    print(f"Seeded {len(NIGERIAN_STATES)} states")


def seed_lgas(db: Session):
    """Seed sample LGAs"""
    print("Seeding LGAs...")
    count = 0
    for state_name, lgas in SAMPLE_LGAS.items():
        state = db.query(State).filter(State.name == state_name).first()
        if state:
            for lga_name in lgas:
                existing = db.query(Lga).filter(Lga.name == lga_name, Lga.state_id == state.id).first()
                if not existing:
                    lga = Lga(name=lga_name, state_id=state.id)
                    db.add(lga)
                    count += 1
    db.commit()
    print(f"Seeded {count} LGAs")


def seed_senators(db: Session):
    """Seed senators"""
    print("Seeding senators...")
    for sen_data in SENATORS:
        state = db.query(State).filter(State.name == sen_data["state"]).first()
        if state:
            existing = db.query(Representative).filter(
                Representative.name == sen_data["name"],
                Representative.chamber == Chamber.SENATE
            ).first()
            if not existing:
                senator = Representative(
                    name=sen_data["name"],
                    title=sen_data["title"],
                    chamber=Chamber.SENATE,
                    party=sen_data["party"],
                    state_id=state.id,
                    senatorial_district=sen_data["district"],
                    bio=sen_data["bio"],
                    is_active=True
                )
                db.add(senator)
                db.flush()
                
                # Add contact info
                email = f"{sen_data['name'].lower().replace(' ', '.')}@nass.gov.ng"
                contact = ContactInfo(
                    representative_id=senator.id,
                    contact_type=ContactType.EMAIL,
                    value=email,
                    is_primary=True
                )
                db.add(contact)
    db.commit()
    print(f"Seeded {len(SENATORS)} senators")


def seed_house_reps(db: Session):
    """Seed House of Representatives members"""
    print("Seeding House of Reps...")
    for rep_data in HOUSE_REPS:
        state = db.query(State).filter(State.name == rep_data["state"]).first()
        if state:
            existing = db.query(Representative).filter(
                Representative.name == rep_data["name"],
                Representative.chamber == Chamber.HOUSE_OF_REPS
            ).first()
            if not existing:
                rep = Representative(
                    name=rep_data["name"],
                    title=rep_data["title"],
                    chamber=Chamber.HOUSE_OF_REPS,
                    party=rep_data["party"],
                    state_id=state.id,
                    constituency=rep_data["constituency"],
                    bio=rep_data["bio"],
                    is_active=True
                )
                db.add(rep)
                db.flush()
                
                email = f"{rep_data['name'].lower().replace(' ', '.')}@nass.gov.ng"
                contact = ContactInfo(
                    representative_id=rep.id,
                    contact_type=ContactType.EMAIL,
                    value=email,
                    is_primary=True
                )
                db.add(contact)
    db.commit()
    print(f"Seeded {len(HOUSE_REPS)} House of Reps members")


def seed_lga_chairmen(db: Session):
    """Seed LGA Chairmen"""
    print("Seeding LGA Chairmen...")
    for chair_data in LGA_CHAIRMEN:
        state = db.query(State).filter(State.name == chair_data["state"]).first()
        if state:
            lga = db.query(Lga).filter(Lga.name == chair_data["lga"], Lga.state_id == state.id).first()
            if lga:
                existing = db.query(Representative).filter(
                    Representative.name == chair_data["name"],
                    Representative.chamber == Chamber.LGA_CHAIRMAN
                ).first()
                if not existing:
                    chairman = Representative(
                        name=chair_data["name"],
                        title=chair_data["title"],
                        chamber=Chamber.LGA_CHAIRMAN,
                        party=chair_data["party"],
                        state_id=state.id,
                        lga_id=lga.id,
                        bio=chair_data["bio"],
                        is_active=True
                    )
                    db.add(chairman)
                    db.flush()
                    
                    email = f"chairman@{chair_data['lga'].lower().replace('/', '').replace(' ', '')}.lg.gov.ng"
                    contact = ContactInfo(
                        representative_id=chairman.id,
                        contact_type=ContactType.EMAIL,
                        value=email,
                        is_primary=True
                    )
                    db.add(contact)
    db.commit()
    print(f"Seeded {len(LGA_CHAIRMEN)} LGA Chairmen")


def seed_legal_documents(db: Session):
    """Seed a few sections from the 1999 Constitution"""
    docs = [
        {
            "title": "1999 Constitution of Nigeria",
            "chapter": "Chapter II",
            "section": "Section 14",
            "heading": "The Federal Republic",
            "content": (
                "The Federal Republic of Nigeria shall be a State based on the principles of "
                "democracy and social justice."
            ),
            "tags": ["structure", "federalism", "principles"],
        },
        {
            "title": "1999 Constitution of Nigeria",
            "chapter": "Chapter IV",
            "section": "Section 33",
            "heading": "Right to Life",
            "content": (
                "Every person has a right to life, and no one shall be deprived intentionally of "
                "his life except in the execution of the sentence of a court in respect of a criminal "
                "offence of which he has been found guilty in Nigeria."
            ),
            "tags": ["rights", "life"],
        },
        {
            "title": "1999 Constitution of Nigeria",
            "chapter": "Chapter IV",
            "section": "Section 40",
            "heading": "Freedom of Religion",
            "content": (
                "Every person shall be entitled to freedom of thought, conscience and religion, "
                "including freedom to change his religion or belief and freedom, either alone or "
                "in community with others, and in public or private, to manifest and propagate "
                "his religion or belief in worship, teaching, practice and observance."
            ),
            "tags": ["rights", "religion"],
        },
    ]

    print("Seeding constitution sections...")
    for doc_data in docs:
        exists = (
            db.query(LegalDocument)
            .filter(
                LegalDocument.chapter == doc_data["chapter"],
                LegalDocument.section == doc_data["section"],
            )
            .first()
        )
        if not exists:
            doc = LegalDocument(**doc_data)
            db.add(doc)
    db.commit()
    print(f"Seeded {len(docs)} legal document sections")

def run_seed():
    """Run all seed functions"""
    print("=" * 50)
    print("Voice2Gov Database Seeding")
    print("=" * 50)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_states(db)
        seed_lgas(db)
        seed_senators(db)
        seed_house_reps(db)
        seed_lga_chairmen(db)
        seed_legal_documents(db)
        
        # Print summary
        print("\n" + "=" * 50)
        print("Seeding Complete!")
        print("=" * 50)
        print(f"States: {db.query(State).count()}")
        print(f"LGAs: {db.query(Lga).count()}")
        print(f"Senators: {db.query(Representative).filter(Representative.chamber == Chamber.SENATE).count()}")
        print(f"House of Reps: {db.query(Representative).filter(Representative.chamber == Chamber.HOUSE_OF_REPS).count()}")
        print(f"LGA Chairmen: {db.query(Representative).filter(Representative.chamber == Chamber.LGA_CHAIRMAN).count()}")
        
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
