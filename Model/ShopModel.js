const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt');

const ShopSchema = new Schema({
    owner_name:{
        type: String,
        required: true
    },
    contact_details:{
        email:{
            type: String,
            required: true,
            unique: true
        },
        phone:{
            type: String,
            required:true
        }
    },
    password:{
        type: String,
        required: true
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    shop_details: {
        shop_image:{
            type: String,
            required: true
        },
        shop_name: {
            type: String,
            required: true
        },
        description:{
            type: String,
            required: true
        },
        category:{
            type: String,
            required: true
        },
        address:{
            type: String,
            required: true
        },
        lat:{
            type: String,
            required: true
        },
        long:{
            type: String,
            required: true
        }
    }
});

ShopSchema.index({ location: '2dsphere' });

ShopSchema.pre('save', async function(next){
    const shop = this;

    if(shop.isModified('password')){
        shop.password = await bcrypt.hash(shop.password, 10);
    }

    next();
});

const Shop = mongoose.model('shop', ShopSchema);
module.exports = Shop;