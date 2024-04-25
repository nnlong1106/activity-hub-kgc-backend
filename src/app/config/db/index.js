const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(
            'mongodb+srv://nnlong:crk2nETS6sPZr7jA@atlascluster.m3za2bp.mongodb.net/activity-hub-kgc-dev',
        );
        console.log('Connect DB successfully');
    } catch (error) {
        console.log('Connect DB failure');
    }
}

module.exports = { connect };
