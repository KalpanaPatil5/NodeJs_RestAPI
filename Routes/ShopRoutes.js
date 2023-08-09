const express = require('express');
const router = express();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Shop = require('../Model/ShopModel');

//get all shops
router.get('/', async (req, res) => {
    try{
        const shops = await Shop.find();
        res.json({ shops });
    } catch (error) {
        return res.status(500).json({ error: error.message});
    }
});

//register new user
router.post('/', async (req, res) => {
    try{
        const {owner_name,email,password,contact_details,shop_details} = req.body;

        const existingShop = await Shop.findOne({'contact_details.email': email});

        if(existingShop){
            return res.status(400).json({ error: "Email already registered"});
        }

        const newShop = new Shop({
            owner_name,
            contact_details,
            password,
            shop_details
        });

        await newShop.save();

        const token = jwt.sign({ ownerId: newShop._id }, 'secret_key');

        newShop.tokens = newShop.tokens.concat({token});
        await newShop.save();

        res.status(201).json({ shop: newShop, token});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//login user
router.post('/login', async(req, res) => {
    const {email, password} = req.body;

    try{
        const shop = await Shop.findOne({ 'contact_details.email': email });

        if(!shop){
            return res.status(401).json({ message: "Invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password, shop.password);

        if(!isMatch){
            return res.status(401).json({ message: "Invalid credentials"});
        }

        const token = jwt.sign({ shopId: shop._id}, 'secret_key', { expiresIn: '1h'});

        shop.tokens.push({ token });
        await shop.save();

        res.json({ message: "Login successful" });
    } catch(error) {
        return res.status(500).json({ error: error.message});
    }
});

//update/edit shop
router.patch('/:id', async (req, res) => {
    const shopId = req.params.id;
    const updates = req.body;

    try{
        const shop = await Shop.findByIdAndUpdate(shopId, updates, { new: true });

        if(!shop){
            return res.status(404).json({ message: "Shop not found "});
        }

        res.json({ shop });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

//delete shop by id
router.delete('/:id', async (req, res) => {
    const shopId = req.params.id;

    try{
        const deletedShop = await Shop.findOneAndDelete({ _id: shopId });

        if(!deletedShop){
            return res.status(404).json({ message: "Shop not found"});
        }

        res.json({ message: "Shop deleted", deletedShop});
    } catch(error){
        return res.status(500).json({ error: error.message });
    }
});

//search shop by category
router.get('/search', async (req, res) => {
    const encodeCategory = req.query.category;
    const decodeCategory = decodeURIComponent(encodeCategory);

    try{
        const shops = await Shop.find({ 'shop_details.category': encodeCategory });

        if(shops.length === 0){
            return res.status(404).json({ message: "No shpos found under this category" });
        }

        res.json({ message: "shops found", shops});
    } catch(error){
        return res.status(500).json({ error: error.message });
    }
});

//search nearby shops
router.get('/nearby', async( req, res ) => {
    const { lat, long } = req.query;

    try{
        const shops = await Shop.find({
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(long), parseFloat(lat)]
                    },
                    $maxDistance: 100000
                }
            }
        });
        console.log(shops);
        res.json({ message: "Shops nearby", shops });
    } catch(error){
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;