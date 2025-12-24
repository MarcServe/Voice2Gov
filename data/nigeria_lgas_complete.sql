-- Complete Nigerian LGAs and States Data
-- Run this in Supabase SQL Editor to populate all 774 LGAs

-- First, ensure all 36 states + FCT exist
INSERT INTO states (name, code, region, capital) VALUES
('Abia', 'AB', 'South East', 'Umuahia'),
('Adamawa', 'AD', 'North East', 'Yola'),
('Akwa Ibom', 'AK', 'South South', 'Uyo'),
('Anambra', 'AN', 'South East', 'Awka'),
('Bauchi', 'BA', 'North East', 'Bauchi'),
('Bayelsa', 'BY', 'South South', 'Yenagoa'),
('Benue', 'BE', 'North Central', 'Makurdi'),
('Borno', 'BO', 'North East', 'Maiduguri'),
('Cross River', 'CR', 'South South', 'Calabar'),
('Delta', 'DE', 'South South', 'Asaba'),
('Ebonyi', 'EB', 'South East', 'Abakaliki'),
('Edo', 'ED', 'South South', 'Benin City'),
('Ekiti', 'EK', 'South West', 'Ado-Ekiti'),
('Enugu', 'EN', 'South East', 'Enugu'),
('FCT', 'FC', 'North Central', 'Abuja'),
('Gombe', 'GO', 'North East', 'Gombe'),
('Imo', 'IM', 'South East', 'Owerri'),
('Jigawa', 'JI', 'North West', 'Dutse'),
('Kaduna', 'KD', 'North West', 'Kaduna'),
('Kano', 'KN', 'North West', 'Kano'),
('Katsina', 'KT', 'North West', 'Katsina'),
('Kebbi', 'KE', 'North West', 'Birnin Kebbi'),
('Kogi', 'KO', 'North Central', 'Lokoja'),
('Kwara', 'KW', 'North Central', 'Ilorin'),
('Lagos', 'LA', 'South West', 'Ikeja'),
('Nasarawa', 'NA', 'North Central', 'Lafia'),
('Niger', 'NI', 'North Central', 'Minna'),
('Ogun', 'OG', 'South West', 'Abeokuta'),
('Ondo', 'ON', 'South West', 'Akure'),
('Osun', 'OS', 'South West', 'Osogbo'),
('Oyo', 'OY', 'South West', 'Ibadan'),
('Plateau', 'PL', 'North Central', 'Jos'),
('Rivers', 'RI', 'South South', 'Port Harcourt'),
('Sokoto', 'SO', 'North West', 'Sokoto'),
('Taraba', 'TA', 'North East', 'Jalingo'),
('Yobe', 'YO', 'North East', 'Damaturu'),
('Zamfara', 'ZA', 'North West', 'Gusau')
ON CONFLICT (code) DO NOTHING;

-- Abia State LGAs (17)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Aba North'), ('Aba South'), ('Arochukwu'), ('Bende'), ('Ikwuano'),
('Isiala Ngwa North'), ('Isiala Ngwa South'), ('Isuikwuato'), ('Obi Ngwa'),
('Ohafia'), ('Osisioma'), ('Ugwunagbo'), ('Ukwa East'), ('Ukwa West'),
('Umuahia North'), ('Umuahia South'), ('Umu Nneochi')) AS t(lga_name)
WHERE s.name = 'Abia' ON CONFLICT DO NOTHING;

-- Adamawa State LGAs (21)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Demsa'), ('Fufore'), ('Ganye'), ('Gayuk'), ('Gombi'), ('Grie'), ('Hong'),
('Jada'), ('Lamurde'), ('Madagali'), ('Maiha'), ('Mayo-Belwa'), ('Michika'),
('Mubi North'), ('Mubi South'), ('Numan'), ('Shelleng'), ('Song'), ('Toungo'),
('Yola North'), ('Yola South')) AS t(lga_name)
WHERE s.name = 'Adamawa' ON CONFLICT DO NOTHING;

-- Akwa Ibom State LGAs (31)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Abak'), ('Eastern Obolo'), ('Eket'), ('Esit Eket'), ('Essien Udim'),
('Etim Ekpo'), ('Etinan'), ('Ibeno'), ('Ibesikpo Asutan'), ('Ibiono Ibom'),
('Ika'), ('Ikono'), ('Ikot Abasi'), ('Ikot Ekpene'), ('Ini'), ('Itu'),
('Mbo'), ('Mkpat Enin'), ('Nsit Atai'), ('Nsit Ibom'), ('Nsit Ubium'),
('Obot Akara'), ('Okobo'), ('Onna'), ('Oron'), ('Oruk Anam'), ('Udung Uko'),
('Ukanafun'), ('Uruan'), ('Urue-Offong/Oruko'), ('Uyo')) AS t(lga_name)
WHERE s.name = 'Akwa Ibom' ON CONFLICT DO NOTHING;

-- Anambra State LGAs (21)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Aguata'), ('Anambra East'), ('Anambra West'), ('Anaocha'), ('Awka North'),
('Awka South'), ('Ayamelum'), ('Dunukofia'), ('Ekwusigo'), ('Idemili North'),
('Idemili South'), ('Ihiala'), ('Njikoka'), ('Nnewi North'), ('Nnewi South'),
('Ogbaru'), ('Onitsha North'), ('Onitsha South'), ('Orumba North'), ('Orumba South'),
('Oyi')) AS t(lga_name)
WHERE s.name = 'Anambra' ON CONFLICT DO NOTHING;

-- Bauchi State LGAs (20)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Alkaleri'), ('Bauchi'), ('Bogoro'), ('Damban'), ('Darazo'), ('Dass'),
('Gamawa'), ('Ganjuwa'), ('Giade'), ('Itas/Gadau'), ('Jamaare'), ('Katagum'),
('Kirfi'), ('Misau'), ('Ningi'), ('Shira'), ('Tafawa Balewa'), ('Toro'),
('Warji'), ('Zaki')) AS t(lga_name)
WHERE s.name = 'Bauchi' ON CONFLICT DO NOTHING;

-- Bayelsa State LGAs (8)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Brass'), ('Ekeremor'), ('Kolokuma/Opokuma'), ('Nembe'), ('Ogbia'),
('Sagbama'), ('Southern Ijaw'), ('Yenagoa')) AS t(lga_name)
WHERE s.name = 'Bayelsa' ON CONFLICT DO NOTHING;

-- Benue State LGAs (23)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Ado'), ('Agatu'), ('Apa'), ('Buruku'), ('Gboko'), ('Guma'), ('Gwer East'),
('Gwer West'), ('Katsina-Ala'), ('Konshisha'), ('Kwande'), ('Logo'), ('Makurdi'),
('Obi'), ('Ogbadibo'), ('Ohimini'), ('Oju'), ('Okpokwu'), ('Otukpo'), ('Tarka'),
('Ukum'), ('Ushongo'), ('Vandeikya')) AS t(lga_name)
WHERE s.name = 'Benue' ON CONFLICT DO NOTHING;

-- Borno State LGAs (27)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Abadam'), ('Askira/Uba'), ('Bama'), ('Bayo'), ('Biu'), ('Chibok'),
('Damboa'), ('Dikwa'), ('Gubio'), ('Guzamala'), ('Gwoza'), ('Hawul'), ('Jere'),
('Kaga'), ('Kala/Balge'), ('Konduga'), ('Kukawa'), ('Kwaya Kusar'), ('Mafa'),
('Magumeri'), ('Maiduguri'), ('Marte'), ('Mobbar'), ('Monguno'), ('Ngala'),
('Nganzai'), ('Shani')) AS t(lga_name)
WHERE s.name = 'Borno' ON CONFLICT DO NOTHING;

-- Cross River State LGAs (18)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Abi'), ('Akamkpa'), ('Akpabuyo'), ('Bakassi'), ('Bekwarra'), ('Biase'),
('Boki'), ('Calabar Municipal'), ('Calabar South'), ('Etung'), ('Ikom'),
('Obanliku'), ('Obubra'), ('Obudu'), ('Odukpani'), ('Ogoja'), ('Yakurr'),
('Yala')) AS t(lga_name)
WHERE s.name = 'Cross River' ON CONFLICT DO NOTHING;

-- Delta State LGAs (25)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Aniocha North'), ('Aniocha South'), ('Bomadi'), ('Burutu'), ('Ethiope East'),
('Ethiope West'), ('Ika North East'), ('Ika South'), ('Isoko North'), ('Isoko South'),
('Ndokwa East'), ('Ndokwa West'), ('Okpe'), ('Oshimili North'), ('Oshimili South'),
('Patani'), ('Sapele'), ('Udu'), ('Ughelli North'), ('Ughelli South'), ('Ukwuani'),
('Uvwie'), ('Warri North'), ('Warri South'), ('Warri South West')) AS t(lga_name)
WHERE s.name = 'Delta' ON CONFLICT DO NOTHING;

-- Ebonyi State LGAs (13)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Abakaliki'), ('Afikpo North'), ('Afikpo South'), ('Ebonyi'), ('Ezza North'),
('Ezza South'), ('Ikwo'), ('Ishielu'), ('Ivo'), ('Izzi'), ('Ohaozara'),
('Ohaukwu'), ('Onicha')) AS t(lga_name)
WHERE s.name = 'Ebonyi' ON CONFLICT DO NOTHING;

-- Edo State LGAs (18)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Akoko-Edo'), ('Egor'), ('Esan Central'), ('Esan North-East'), ('Esan South-East'),
('Esan West'), ('Etsako Central'), ('Etsako East'), ('Etsako West'), ('Igueben'),
('Ikpoba-Okha'), ('Oredo'), ('Orhionmwon'), ('Ovia North-East'), ('Ovia South-West'),
('Owan East'), ('Owan West'), ('Uhunmwonde')) AS t(lga_name)
WHERE s.name = 'Edo' ON CONFLICT DO NOTHING;

-- Ekiti State LGAs (16)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Ado Ekiti'), ('Efon'), ('Ekiti East'), ('Ekiti South-West'), ('Ekiti West'),
('Emure'), ('Gbonyin'), ('Ido Osi'), ('Ijero'), ('Ikere'), ('Ikole'), ('Ilejemeje'),
('Irepodun/Ifelodun'), ('Ise/Orun'), ('Moba'), ('Oye')) AS t(lga_name)
WHERE s.name = 'Ekiti' ON CONFLICT DO NOTHING;

-- Enugu State LGAs (17)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Aninri'), ('Awgu'), ('Enugu East'), ('Enugu North'), ('Enugu South'),
('Ezeagu'), ('Igbo Etiti'), ('Igbo Eze North'), ('Igbo Eze South'), ('Isi Uzo'),
('Nkanu East'), ('Nkanu West'), ('Nsukka'), ('Oji River'), ('Udenu'), ('Udi'),
('Uzo-Uwani')) AS t(lga_name)
WHERE s.name = 'Enugu' ON CONFLICT DO NOTHING;

-- FCT LGAs (6)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Abaji'), ('Bwari'), ('Gwagwalada'), ('Kuje'), ('Kwali'),
('Municipal Area Council')) AS t(lga_name)
WHERE s.name = 'FCT' ON CONFLICT DO NOTHING;

-- Gombe State LGAs (11)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Akko'), ('Balanga'), ('Billiri'), ('Dukku'), ('Funakaye'), ('Gombe'),
('Kaltungo'), ('Kwami'), ('Nafada'), ('Shongom'), ('Yamaltu/Deba')) AS t(lga_name)
WHERE s.name = 'Gombe' ON CONFLICT DO NOTHING;

-- Imo State LGAs (27)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Aboh Mbaise'), ('Ahiazu Mbaise'), ('Ehime Mbano'), ('Ezinihitte'), ('Ideato North'),
('Ideato South'), ('Ihitte/Uboma'), ('Ikeduru'), ('Isiala Mbano'), ('Isu'),
('Mbaitoli'), ('Ngor Okpala'), ('Njaba'), ('Nkwerre'), ('Nwangele'), ('Obowo'),
('Oguta'), ('Ohaji/Egbema'), ('Okigwe'), ('Onuimo'), ('Orlu'), ('Orsu'),
('Oru East'), ('Oru West'), ('Owerri Municipal'), ('Owerri North'), ('Owerri West')) AS t(lga_name)
WHERE s.name = 'Imo' ON CONFLICT DO NOTHING;

-- Jigawa State LGAs (27)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Auyo'), ('Babura'), ('Biriniwa'), ('Birnin Kudu'), ('Buji'), ('Dutse'),
('Gagarawa'), ('Garki'), ('Gumel'), ('Guri'), ('Gwaram'), ('Gwiwa'), ('Hadejia'),
('Jahun'), ('Kafin Hausa'), ('Kaugama'), ('Kazaure'), ('Kiri Kasama'), ('Kiyawa'),
('Maigatari'), ('Malam Madori'), ('Miga'), ('Ringim'), ('Roni'), ('Sule Tankarkar'),
('Taura'), ('Yankwashi')) AS t(lga_name)
WHERE s.name = 'Jigawa' ON CONFLICT DO NOTHING;

-- Kaduna State LGAs (23)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Birnin Gwari'), ('Chikun'), ('Giwa'), ('Igabi'), ('Ikara'), ('Jaba'),
('Jema''a'), ('Kachia'), ('Kaduna North'), ('Kaduna South'), ('Kagarko'), ('Kajuru'),
('Kaura'), ('Kauru'), ('Kubau'), ('Kudan'), ('Lere'), ('Makarfi'), ('Sabon Gari'),
('Sanga'), ('Soba'), ('Zangon Kataf'), ('Zaria')) AS t(lga_name)
WHERE s.name = 'Kaduna' ON CONFLICT DO NOTHING;

-- Kano State LGAs (44)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Ajingi'), ('Albasu'), ('Bagwai'), ('Bebeji'), ('Bichi'), ('Bunkure'),
('Dala'), ('Dambatta'), ('Dawakin Kudu'), ('Dawakin Tofa'), ('Doguwa'), ('Fagge'),
('Gabasawa'), ('Garko'), ('Garun Mallam'), ('Gaya'), ('Gezawa'), ('Gwale'),
('Gwarzo'), ('Kabo'), ('Kano Municipal'), ('Karaye'), ('Kibiya'), ('Kiru'),
('Kumbotso'), ('Kunchi'), ('Kura'), ('Madobi'), ('Makoda'), ('Minjibir'),
('Nasarawa'), ('Rano'), ('Rimin Gado'), ('Rogo'), ('Shanono'), ('Sumaila'),
('Takai'), ('Tarauni'), ('Tofa'), ('Tsanyawa'), ('Tudun Wada'), ('Ungogo'),
('Warawa'), ('Wudil')) AS t(lga_name)
WHERE s.name = 'Kano' ON CONFLICT DO NOTHING;

-- Katsina State LGAs (34)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Bakori'), ('Batagarawa'), ('Batsari'), ('Baure'), ('Bindawa'), ('Charanchi'),
('Dandume'), ('Danja'), ('Dan Musa'), ('Daura'), ('Dutsi'), ('Dutsin Ma'), ('Faskari'),
('Funtua'), ('Ingawa'), ('Jibia'), ('Kafur'), ('Kaita'), ('Kankara'), ('Kankia'),
('Katsina'), ('Kurfi'), ('Kusada'), ('Mai''Adua'), ('Malumfashi'), ('Mani'),
('Mashi'), ('Matazu'), ('Musawa'), ('Rimi'), ('Sabuwa'), ('Safana'), ('Sandamu'),
('Zango')) AS t(lga_name)
WHERE s.name = 'Katsina' ON CONFLICT DO NOTHING;

-- Kebbi State LGAs (21)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Aleiro'), ('Arewa Dandi'), ('Argungu'), ('Augie'), ('Bagudo'), ('Birnin Kebbi'),
('Bunza'), ('Dandi'), ('Fakai'), ('Gwandu'), ('Jega'), ('Kalgo'), ('Koko/Besse'),
('Maiyama'), ('Ngaski'), ('Sakaba'), ('Shanga'), ('Suru'), ('Wasagu/Danko'),
('Yauri'), ('Zuru')) AS t(lga_name)
WHERE s.name = 'Kebbi' ON CONFLICT DO NOTHING;

-- Kogi State LGAs (21)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Adavi'), ('Ajaokuta'), ('Ankpa'), ('Bassa'), ('Dekina'), ('Ibaji'), ('Idah'),
('Igalamela-Odolu'), ('Ijumu'), ('Kabba/Bunu'), ('Kogi'), ('Lokoja'), ('Mopa-Muro'),
('Ofu'), ('Ogori/Magongo'), ('Okehi'), ('Okene'), ('Olamaboro'), ('Omala'),
('Yagba East'), ('Yagba West')) AS t(lga_name)
WHERE s.name = 'Kogi' ON CONFLICT DO NOTHING;

-- Kwara State LGAs (16)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Asa'), ('Baruten'), ('Edu'), ('Ekiti'), ('Ifelodun'), ('Ilorin East'),
('Ilorin South'), ('Ilorin West'), ('Irepodun'), ('Isin'), ('Kaiama'), ('Moro'),
('Offa'), ('Oke Ero'), ('Oyun'), ('Pategi')) AS t(lga_name)
WHERE s.name = 'Kwara' ON CONFLICT DO NOTHING;

-- Lagos State LGAs (20)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Agege'), ('Ajeromi-Ifelodun'), ('Alimosho'), ('Amuwo-Odofin'), ('Apapa'),
('Badagry'), ('Epe'), ('Eti-Osa'), ('Ibeju-Lekki'), ('Ifako-Ijaiye'), ('Ikeja'),
('Ikorodu'), ('Kosofe'), ('Lagos Island'), ('Lagos Mainland'), ('Mushin'), ('Ojo'),
('Oshodi-Isolo'), ('Shomolu'), ('Surulere')) AS t(lga_name)
WHERE s.name = 'Lagos' ON CONFLICT DO NOTHING;

-- Nasarawa State LGAs (13)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Akwanga'), ('Awe'), ('Doma'), ('Karu'), ('Keana'), ('Keffi'), ('Kokona'),
('Lafia'), ('Nasarawa'), ('Nasarawa Egon'), ('Obi'), ('Toto'), ('Wamba')) AS t(lga_name)
WHERE s.name = 'Nasarawa' ON CONFLICT DO NOTHING;

-- Niger State LGAs (25)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Agaie'), ('Agwara'), ('Bida'), ('Borgu'), ('Bosso'), ('Chanchaga'), ('Edati'),
('Gbako'), ('Gurara'), ('Katcha'), ('Kontagora'), ('Lapai'), ('Lavun'), ('Magama'),
('Mariga'), ('Mashegu'), ('Mokwa'), ('Moya'), ('Paikoro'), ('Rafi'), ('Rijau'),
('Shiroro'), ('Suleja'), ('Tafa'), ('Wushishi')) AS t(lga_name)
WHERE s.name = 'Niger' ON CONFLICT DO NOTHING;

-- Ogun State LGAs (20)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Abeokuta North'), ('Abeokuta South'), ('Ado-Odo/Ota'), ('Egbado North'),
('Egbado South'), ('Ewekoro'), ('Ifo'), ('Ijebu East'), ('Ijebu North'),
('Ijebu North East'), ('Ijebu Ode'), ('Ikenne'), ('Imeko Afon'), ('Ipokia'),
('Obafemi Owode'), ('Odeda'), ('Odogbolu'), ('Ogun Waterside'), ('Remo North'),
('Shagamu')) AS t(lga_name)
WHERE s.name = 'Ogun' ON CONFLICT DO NOTHING;

-- Ondo State LGAs (18)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Akoko North-East'), ('Akoko North-West'), ('Akoko South-East'), ('Akoko South-West'),
('Akure North'), ('Akure South'), ('Ese Odo'), ('Idanre'), ('Ifedore'), ('Ilaje'),
('Ile Oluji/Okeigbo'), ('Irele'), ('Odigbo'), ('Okitipupa'), ('Ondo East'),
('Ondo West'), ('Ose'), ('Owo')) AS t(lga_name)
WHERE s.name = 'Ondo' ON CONFLICT DO NOTHING;

-- Osun State LGAs (30)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Aiyedaade'), ('Aiyedire'), ('Atakumosa East'), ('Atakumosa West'), ('Boluwaduro'),
('Boripe'), ('Ede North'), ('Ede South'), ('Egbedore'), ('Ejigbo'), ('Ife Central'),
('Ife East'), ('Ife North'), ('Ife South'), ('Ifedayo'), ('Ifelodun'), ('Ila'),
('Ilesa East'), ('Ilesa West'), ('Irepodun'), ('Irewole'), ('Isokan'), ('Iwo'),
('Obokun'), ('Odo Otin'), ('Ola Oluwa'), ('Olorunda'), ('Oriade'), ('Orolu'),
('Osogbo')) AS t(lga_name)
WHERE s.name = 'Osun' ON CONFLICT DO NOTHING;

-- Oyo State LGAs (33)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Afijio'), ('Akinyele'), ('Atiba'), ('Atisbo'), ('Egbeda'), ('Ibadan North'),
('Ibadan North-East'), ('Ibadan North-West'), ('Ibadan South-East'), ('Ibadan South-West'),
('Ibarapa Central'), ('Ibarapa East'), ('Ibarapa North'), ('Ido'), ('Irepo'),
('Iseyin'), ('Itesiwaju'), ('Iwajowa'), ('Kajola'), ('Lagelu'), ('Ogbomosho North'),
('Ogbomosho South'), ('Ogo Oluwa'), ('Olorunsogo'), ('Oluyole'), ('Ona Ara'),
('Orelope'), ('Ori Ire'), ('Oyo East'), ('Oyo West'), ('Saki East'), ('Saki West'),
('Surulere')) AS t(lga_name)
WHERE s.name = 'Oyo' ON CONFLICT DO NOTHING;

-- Plateau State LGAs (17)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Barkin Ladi'), ('Bassa'), ('Bokkos'), ('Jos East'), ('Jos North'), ('Jos South'),
('Kanam'), ('Kanke'), ('Langtang North'), ('Langtang South'), ('Mangu'), ('Mikang'),
('Pankshin'), ('Qua''an Pan'), ('Riyom'), ('Shendam'), ('Wase')) AS t(lga_name)
WHERE s.name = 'Plateau' ON CONFLICT DO NOTHING;

-- Rivers State LGAs (23)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Abua/Odual'), ('Ahoada East'), ('Ahoada West'), ('Akuku-Toru'), ('Andoni'),
('Asari-Toru'), ('Bonny'), ('Degema'), ('Eleme'), ('Emohua'), ('Etche'), ('Gokana'),
('Ikwerre'), ('Khana'), ('Obio/Akpor'), ('Ogba/Egbema/Ndoni'), ('Ogu/Bolo'),
('Okrika'), ('Omuma'), ('Opobo/Nkoro'), ('Oyigbo'), ('Port Harcourt'), ('Tai')) AS t(lga_name)
WHERE s.name = 'Rivers' ON CONFLICT DO NOTHING;

-- Sokoto State LGAs (23)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Binji'), ('Bodinga'), ('Dange Shuni'), ('Gada'), ('Goronyo'), ('Gudu'),
('Gwadabawa'), ('Illela'), ('Isa'), ('Kebbe'), ('Kware'), ('Rabah'), ('Sabon Birni'),
('Shagari'), ('Silame'), ('Sokoto North'), ('Sokoto South'), ('Tambuwal'), ('Tangaza'),
('Tureta'), ('Wamako'), ('Wurno'), ('Yabo')) AS t(lga_name)
WHERE s.name = 'Sokoto' ON CONFLICT DO NOTHING;

-- Taraba State LGAs (16)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Ardo Kola'), ('Bali'), ('Donga'), ('Gashaka'), ('Gassol'), ('Ibi'),
('Jalingo'), ('Karim Lamido'), ('Kurmi'), ('Lau'), ('Sardauna'), ('Takum'),
('Ussa'), ('Wukari'), ('Yorro'), ('Zing')) AS t(lga_name)
WHERE s.name = 'Taraba' ON CONFLICT DO NOTHING;

-- Yobe State LGAs (17)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Bade'), ('Bursari'), ('Damaturu'), ('Fika'), ('Fune'), ('Geidam'), ('Gujba'),
('Gulani'), ('Jakusko'), ('Karasuwa'), ('Machina'), ('Nangere'), ('Nguru'),
('Potiskum'), ('Tarmuwa'), ('Yunusari'), ('Yusufari')) AS t(lga_name)
WHERE s.name = 'Yobe' ON CONFLICT DO NOTHING;

-- Zamfara State LGAs (14)
INSERT INTO lgas (name, state_id) 
SELECT lga_name, s.id FROM states s, 
(VALUES ('Anka'), ('Bakura'), ('Birnin Magaji/Kiyaw'), ('Bukkuyum'), ('Bungudu'),
('Gummi'), ('Gusau'), ('Kaura Namoda'), ('Maradun'), ('Maru'), ('Shinkafi'),
('Talata Mafara'), ('Tsafe'), ('Zurmi')) AS t(lga_name)
WHERE s.name = 'Zamfara' ON CONFLICT DO NOTHING;

-- Now you can view your data
SELECT s.name AS state, COUNT(l.id) AS lga_count 
FROM states s 
LEFT JOIN lgas l ON l.state_id = s.id 
GROUP BY s.name 
ORDER BY s.name;

