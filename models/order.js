"use strict";

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.Types.ObjectId,
    timestamps = require('mongoose-timestamp'),
    async = require('async'),
    _ = require('lodash');

var DataTable = require('mongoose-datatable');

DataTable.configure({
    verbose: false,
    debug: false
});
mongoose.plugin(DataTable.init);

var Dict = INCLUDE('dict');

var setPrice = MODULE('utils').setPrice;
var setDate = MODULE('utils').setDate;

var options = {
    collection: 'Orders',
    discriminatorKey: '_type',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
};


const baseSchema = new Schema({
    forSales: { type: Boolean, default: true },
    isremoved: Boolean,
    ref: { type: String, index: true },
    ID: { type: Number, unique: true },
    /*title: {//For internal use only
        ref: String,
        autoGenerated: {
            type: Boolean,
            default: false
        } //For automatic process generated deliveries
    },*/
    currency: {
        _id: { type: String, ref: 'currency', default: '' },
        rate: { type: Number, default: 1 } // changed default to '0' for catching errors
    },

    Status: { type: String, default: 'DRAFT' },
    cond_reglement_code: {
        type: String,
        default: 'RECEP'
    },
    mode_reglement_code: {
        type: String,
        default: 'TIP'
    },
    //bank_reglement: {type: String},
    //availability_code: {type: String, default: 'AV_NOW'},
    type: {
        type: String,
        default: 'SRC_COMM'
    },
    supplier: { type: Schema.Types.ObjectId, ref: 'Customers', require: true },
    contacts: [{ type: Schema.Types.ObjectId, ref: 'Customers' }],
    ref_client: { type: String, default: "" },
    datec: {
        type: Date,
        default: Date.now,
        set: setDate
    },
    date_livraison: {
        type: Date,
        set: setDate
    },
    notes: [{
        title: String,
        note: String,
        public: {
            type: Boolean,
            default: false
        },
        edit: {
            type: Boolean,
            default: false
        }
    }],
    discount: {
        escompte: {
            percent: { type: Number, default: 0 },
            value: { type: Number, default: 0, set: setPrice } // total remise globale
        },
        discount: {
            percent: { type: Number, default: 0 }, //discount
            value: { type: Number, default: 0, set: setPrice } // total remise globale
        }
    },
    total_ht: {
        type: Number,
        default: 0,
        set: setPrice
    },
    total_taxes: [{
        _id: false,
        taxeId: { type: Schema.Types.ObjectId, ref: 'taxes' },
        value: { type: Number, default: 0 }
    }],
    total_ttc: {
        type: Number,
        default: 0,
        set: setPrice
    },
    shipping: {
        total_ht: {
            type: Number,
            default: 0,
            set: setPrice
        },
        total_taxes: [{
            _id: false,
            taxeId: { type: Schema.Types.ObjectId, ref: 'taxes' },
            value: { type: Number, default: 0 }
        }],
        /*total_ttc: {
            type: Number,
            default: 0
        }*/
    },
    createdBy: { type: ObjectId, ref: 'Users' },
    editedBy: { type: ObjectId, ref: 'Users' },
    salesPerson: { type: ObjectId, ref: 'Employees' }, //commercial_id
    salesTeam: { type: ObjectId, ref: 'Department' },
    entity: String,
    optional: Schema.Types.Mixed,
    order: { type: ObjectId, ref: 'order' }, //Link to OrderRow
    delivery_mode: { type: String, default: "Comptoir" },
    billing: { type: Schema.Types.ObjectId, ref: 'Customers' },
    //costList: { type: ObjectId, ref: 'priceList', default: null }, //Not used
    //priceList: { type: ObjectId, ref: 'priceList', default: null },
    address: {
        name: { type: String, default: '' },
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        country: { type: String, ref: 'countries', default: 'FR' }
    },
    shippingAddress: {
        _id: { type: ObjectId, default: null },
        name: { type: String, default: '' },
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        country: { type: String, ref: 'countries', default: 'FR' }
    },
    /*bl: [{
        label: String,
        name: String,
        contact: String,
        address: String,
        zip: String,
        town: String,
        products: [{
            id: Schema.Types.ObjectId,
            name: String,
            qty: {
                type: Number,
                default: 0
            } // QTY Order
        }],
        shipping: {
            id: String,
            label: String,
            address: Boolean,
            total_ht: {
                type: Number,
                default: 0
            }
        }
    }],*/
    weight: { type: Number, default: 0 }, // Poids total
    /*lines: [{
        _id: false,
        //pu: {type: Number, default: 0},
        type: { type: String, default: 'product' }, //Used for subtotal
        refProductSupplier: String, //Only for an order Supplier
        qty: { type: Number, default: 0 },
        //price_base_type: String,
        //title: String,
        priceSpecific: { type: Boolean, default: false },
        pu_ht: {
            type: Number,
            default: 0
        },
        description: String,
        private: String, // Private note
        product_type: String,
        product: { type: Schema.Types.ObjectId, ref: "product" },
        total_taxes: [{
            _id: false,
            taxeId: { type: Schema.Types.ObjectId, ref: 'taxes' },
            value: { type: Number }
        }],
        discount: { type: Number, default: 0 },
        total_ht: { type: Number, default: 0, set: setPrice },
        //weight: { type: Number, default: 0 },
        optional: { type: Schema.Types.Mixed }
    }],*/
    history: [{
        date: { type: Date, default: Date.now },
        author: {
            id: String,
            name: String
        },
        mode: String, //email, order, alert, new, ...
        Status: String,
        msg: String
    }],

    warehouse: { type: ObjectId, ref: 'warehouse', default: null },

    shippingMethod: { type: ObjectId, ref: 'shippingMethod', default: null },
    shippingCost: { type: Number, default: 0 },

    attachments: { type: Array, default: [] },
    orderRows: [{
        _id: false,
        orderRowId: { type: ObjectId, ref: 'orderRows', default: null },
        product: { type: ObjectId, ref: 'product', default: null },
        locationsDeliver: [{ type: ObjectId, ref: 'location', default: null }],
        cost: { type: Number, default: 0 },
        qty: Number,

        isDeleted: { type: Boolean, default: false }
    }],

    channel: { type: ObjectId, ref: 'integrations', default: null },
    integrationId: String,
    //sequence: Number,
    //name: String

}, options);

baseSchema.plugin(timestamps);

if (CONFIG('storing-files')) {
    var gridfs = INCLUDE(CONFIG('storing-files'));
    baseSchema.plugin(gridfs.pluginGridFs, {
        root: 'Orders'
    });
}

var orderCustomerSchema = new Schema({
    offer: { type: ObjectId, ref: 'order' },

    status: {
        allocateStatus: { type: String, default: 'NOR', enum: ['NOR', 'NOT', 'NOA', 'ALL'] },
        fulfillStatus: { type: String, default: 'NOR', enum: ['NOR', 'NOT', 'NOA', 'ALL'] },
        shippingStatus: { type: String, default: 'NOR', enum: ['NOR', 'NOT', 'NOA', 'ALL'] }
    }
});
var orderSupplierSchema = new Schema({
    offer: { type: ObjectId, ref: 'order' }
});

var quotationCustomerSchema = new Schema({
    orders: [{ type: ObjectId, ref: 'order' }]
});
var quotationSupplierSchema = new Schema({
    orders: [{ type: ObjectId, ref: 'order' }]
});

// Gets listing
baseSchema.statics.query = function(options, callback) {
    var self = this;

    // options.search {String}
    // options.category {String}
    // options.page {String or Number}
    // options.max {String or Number}
    // options.id {String}

    options.page = U.parseInt(options.page) - 1;
    options.max = U.parseInt(options.max, 20);
    if (options.id && typeof(options.id) === 'string')
        options.id = options.id.split(',');
    if (options.page < 0)
        options.page = 0;
    var take = U.parseInt(options.max);
    var skip = U.parseInt(options.page * options.max);

    var query = options.query;
    if (!query.isremoved)
        query.isremoved = { $ne: true };

    //if (options.search)
    //    builder.in('search', options.search.keywords(true, true));
    if (options.id) {
        if (typeof options.id === 'object')
            options.id = { '$in': options.id };
        query._id = options.id;
    }

    var sort = "ref";

    if (options.sort)
        sort = options.sort;

    //console.log(query);

    this.find(query)
        .select(options.fields)
        .limit(take)
        .skip(skip)
        //.populate('category', "_id path url linker name")
        .sort(sort)
        //.lean()
        .exec(function(err, doc) {
            //console.log(doc);
            var data = {};
            data.count = doc.length;
            data.items = doc;
            data.limit = options.max;
            data.pages = Math.ceil(data.count / options.max);

            if (!data.pages)
                data.pages = 1;
            data.page = options.page + 1;
            callback(null, data);
        });
};

// Read Order
/*baseSchema.statics.getById = function(id, callback) {
    var self = this;
    var OrderRowModel = MODEL('orderRows').Schema;

    //TODO Check ACL here
    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    var query = {};

    if (checkForHexRegExp.test(id))
        query = {
            _id: id
        };
    else
        query = {
            ref: id
        };

    //console.log(query);

    self.findOne(query, "-latex")
        .populate("contacts", "name phone email")
        .populate({
            path: "supplier",
            select: "name salesPurchases",
            populate: { path: "salesPurchases.priceList" }
        })
        .populate({
            path: "total_taxes.taxeId"
        })
        .populate("createdBy", "username")
        .populate("editedBy", "username")
        .populate("offer", "ref total_ht forSales")
        .populate("order", "ref total_ht forSales")
        .populate("orders", "ref total_ht forSales")
        .exec(function(err, order) {
            if (err)
                return callback(err);

            if (!order.order)
                order.order = { _id: order._id };

            OrderRowModel.find({ order: order.order._id, isDeleted: { $ne: true } })
                .populate({
                    path: "product",
                    select: "taxes info weight units",
                    //populate: { path: "taxes.taxeId" }
                })
                .populate({
                    path: "total_taxes.taxeId"
                })
                .sort({ sequence: 1 })
                .exec(function(err, rows) {
                    if (err)
                        return callback(err);

                    order = order.toObject();
                    order.lines = rows || [];

                    return callback(err, order);
                });
        });
};*/
baseSchema.statics.getById = function(id, callback) {
    var self = this;
    var OrderRowModel = MODEL('orderRows').Schema;
    var ObjectId = MODULE('utils').ObjectId;

    //TODO Check ACL here
    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    var query = {};

    if (checkForHexRegExp.test(id))
        query = {
            _id: id
        };
    else
        query = {
            ref: id
        };

    //console.log(query);

    async.waterfall([
            function(wCb) {
                self.findOne(query, "-latex")
                    .populate("contacts", "name phone email")
                    .populate({
                        path: "supplier",
                        select: "name salesPurchases",
                        populate: { path: "salesPurchases.priceList" }
                    })
                    .populate({
                        path: "total_taxes.taxeId"
                    })
                    .populate("createdBy", "username")
                    .populate("editedBy", "username")
                    .populate("offer", "ref total_ht forSales")
                    .populate("order", "ref total_ht forSales")
                    .populate("orders", "ref total_ht forSales")
                    .populate("orderRows.product", "taxes info weight units")
                    .exec(wCb);
            },
            function(order, wCb) {

                if (!order.order)
                    order.order = { _id: order._id };

                OrderRowModel.find({ order: order.order._id, isDeleted: { $ne: true } })
                    .populate({
                        path: "product",
                        select: "taxes info weight units",
                        //populate: { path: "taxes.taxeId" }
                    })
                    .populate({
                        path: "total_taxes.taxeId"
                    })
                    .sort({ sequence: 1 })
                    .lean()
                    .exec(function(err, rows) {
                        if (err)
                            return wCb(err);

                        //return console.log(rows);

                        order = order.toObject();
                        order.lines = rows || [];

                        return wCb(err, order);
                    });
            },
            function(order, wCb) {
                OrderRowModel.aggregate([{
                            $match: { order: ObjectId(order.order._id), isDeleted: { $ne: true }, type: 'product' }
                        },
                        {
                            $lookup: {
                                from: 'Product',
                                localField: 'product',
                                foreignField: '_id',
                                as: 'product'
                            }
                        }, {
                            $unwind: {
                                path: '$product'
                            }
                        },
                        {
                            $lookup: {
                                from: 'productTypes',
                                localField: 'product.info.productType',
                                foreignField: '_id',
                                as: 'productType'
                            }
                        }, {
                            $unwind: {
                                path: '$productType'
                            }
                        },
                        {
                            $lookup: {
                                from: 'Orders',
                                localField: 'order',
                                foreignField: 'order',
                                as: 'deliveries'
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                inventory: "$productType.inventory",
                                'product._id': 1,
                                'product.info.SKU': 1,
                                'product.info.langs': 1,
                                'product.weight': 1,
                                'product.directCost': 1,
                                orderQty: "$qty",
                                order: 1,
                                sequence: 1,
                                "deliveries": {
                                    "$filter": {
                                        "input": "$deliveries",
                                        "as": "delivery",
                                        "cond": { $and: [{ $ne: ["$$delivery.isremoved", true] }, { $or: [{ $eq: ['$$delivery._type', 'GoodsOutNote'] }, { $eq: ['$$delivery._type', 'GoodsInNote'] }] }] }
                                    }
                                },
                                refProductSupplier: 1,
                                description: 1
                            }
                        }, {
                            $match: { inventory: true }
                        }, {
                            $project: {
                                _id: 1,
                                inventory: 1,
                                product: 1,
                                orderQty: 1,
                                order: 1,
                                sequence: 1,
                                "deliveries": {
                                    "$filter": {
                                        "input": "$deliveries",
                                        "as": "delivery",
                                        "cond": { $ne: ["$$delivery._id", ObjectId(order._id)] }
                                    }
                                },
                                refProductSupplier: 1,
                                description: 1
                            }
                        },
                        {
                            $unwind: {
                                path: '$deliveries',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                orderQty: 1,
                                order: 1,
                                product: 1,
                                sequence: 1,
                                'deliveries.ref': 1,
                                'deliveries._id': 1,
                                'deliveries.status': 1,
                                'deliveries.date_livraison': 1,
                                'deliveries.orderRows': {
                                    $filter: {
                                        input: "$deliveries.orderRows",
                                        as: "row",
                                        cond: { $eq: ["$$row.orderRowId", "$_id"] }
                                    }
                                },
                                refProductSupplier: 1,
                                description: 1
                            }
                        },
                        {
                            $unwind: {
                                path: '$deliveries.orderRows',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                orderQty: { $first: "$orderQty" },
                                sequence: { $first: "$sequence" },
                                product: { $first: "$product" },
                                deliveryQty: { $sum: "$deliveries.orderRows.qty" },
                                deliveries: { $addToSet: { _id: "$deliveries._id", ref: "$deliveries.ref", qty: "$deliveries.orderRows.qty", date_livraison: "$deliveries.date_livraison", status: "$deliveries.status" } },
                                refProductSupplier: { $first: "$refProductSupplier" },
                                description: { $first: "$description" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                orderRowId: "$_id",
                                orderQty: 1,
                                qty: { $subtract: ["$orderQty", "$deliveryQty"] },
                                sequence: 1,
                                product: 1,
                                cost: "$product.directCost",
                                deliveryQty: 1,
                                deliveries: 1,
                                refProductSupplier: 1,
                                description: 1
                            }
                        },
                        {
                            $sort: {
                                sequence: 1
                            }
                        }
                    ],
                    function(err, result) {
                        wCb(err, order, result);
                    });
            }
        ],
        function(err, order, orderRows) {
            if (err)
                return callback(err);

            //return console.log(orderRows);

            order.orderRows = _.map(orderRows, function(item) {
                return _.extend(item, _.findWhere(order.orderRows, { orderRowId: item.orderRowId }));
            });

            console.log(order.orderRows);

            /*orderRows: [{
                    _id: false,
                    orderRowId: { type: ObjectId, ref: 'orderRows', default: null },
                    product: { type: ObjectId, ref: 'product', default: null },
                    locationsDeliver: [{ type: ObjectId, ref: 'location', default: null }],
                    cost: { type: Number, default: 0 },
                    qty: Number
                }],*/

            return callback(err, order);
        });
};
//orderSupplierSchema.statics.getById = getById;

/**
 * Methods
 */
baseSchema.virtual('_status')
    .get(function() {
        var res_status = {};

        var status = this.Status;
        var statusList = exports.Status;

        if (status && statusList.values[status] && statusList.values[status].label) {
            res_status.id = status;
            res_status.name = i18n.t("orders:" + statusList.values[status].label);
            //this.status.name = statusList.values[status].label;
            res_status.css = statusList.values[status].cssClass;
        } else { // By default
            res_status.id = status;
            res_status.name = status;
            res_status.css = "";
        }

        return res_status;
    });

//Check if orderRow is attached to this main order
baseSchema.virtual('_isOwn')
    .get(function() {
        if (!this.order)
            return false;

        return (this._id === this.order || this._id === this.order._id);
    });



const Order = mongoose.model('order', baseSchema);

/**
 * Delivery
 */

var goodsOutNoteSchema = new Schema({

    tracking: String, //Tracking number

    status: {
        isPrinted: { type: Date, default: null }, //Imprime
        isPicked: { type: Date, default: null }, //Prepare
        isPacked: { type: Date, default: null }, //Emballe
        isShipped: { type: Date, default: null }, //Expedier

        pickedById: { type: ObjectId, ref: 'Users', default: null },
        packedById: { type: ObjectId, ref: 'Users', default: null },
        shippedById: { type: ObjectId, ref: 'Users', default: null },
        printedById: { type: ObjectId, ref: 'Users', default: null }
    },

    boxes: { type: Number, default: 1 },

    archived: { type: Boolean, default: false }
});

var goodsInNoteSchema = new Schema({

    status: {
        isReceived: { type: Date, default: null },
        receivedById: { type: ObjectId, ref: 'Users', default: null }
    },

    description: { type: String },

    boxes: { type: Number, default: 1 },

    orderRows: [{
        _id: false,
        orderRowId: { type: ObjectId, ref: 'orderRows', default: null },
        product: { type: ObjectId, ref: 'product', default: null },
        cost: { type: Number, default: 0 },
        locationsReceived: [{
            _id: false,
            location: { type: ObjectId, ref: 'location', default: null },
            qty: Number
        }],

        isDeleted: { type: Boolean, default: false },

        qty: Number
    }]
});

var stockCorrectionSchema = new Schema({
    status: {
        isReceived: { type: Date, default: null },
        receivedById: { type: ObjectId, ref: 'Users', default: null }
    },

    description: { type: String },

    boxes: { type: Number, default: 1 },

    orderRows: [{
        _id: false,
        orderRowId: { type: ObjectId, ref: 'orderRows', default: null },
        product: { type: ObjectId, ref: 'Product', default: null },
        cost: { type: Number, default: 0 },
        locationsReceived: [{
            _id: false,
            location: { type: ObjectId, ref: 'location', default: null },
            qty: Number
        }],

        qty: Number
    }]
});

var stockReturnSchema = new Schema({
    status: {
        isReceived: { type: Date, default: null },
        receivedById: { type: ObjectId, ref: 'Users', default: null }
    },

    description: { type: String },

    boxes: { type: Number, default: 1 },

    journalEntrySources: [{ type: String, default: '' }],

    orderRows: [{
        _id: false,
        goodsOutNote: { type: ObjectId, ref: 'GoodsOutNote', default: null },
        goodsInNote: { type: ObjectId, ref: 'GoodsInNote', default: null },
        product: { type: ObjectId, ref: 'Product', default: null },
        cost: { type: Number, default: 0 },
        qty: Number,
        warehouse: { type: ObjectId, ref: 'warehouse', default: null }
    }]
});

var stockTransactionsSchema = new Schema({
    warehouseTo: { type: ObjectId, ref: 'warehouse', default: null },
    status: {
        isPrinted: { type: Date, default: null }, //Imprime
        isPicked: { type: Date, default: null }, //Prepare
        isPacked: { type: Date, default: null }, //Emballe
        isShipped: { type: Date, default: null }, //Expedier

        pickedById: { type: ObjectId, ref: 'Users', default: null },
        packedById: { type: ObjectId, ref: 'Users', default: null },
        shippedById: { type: ObjectId, ref: 'Users', default: null },
        printedById: { type: ObjectId, ref: 'Users', default: null }
    },

    boxes: { type: Number, default: 1 },

    orderRows: [{
        _id: false,
        orderRowId: { type: ObjectId, ref: 'orderRows', default: null },
        product: { type: ObjectId, ref: 'Product', default: null },
        locationsDeliver: [{ type: ObjectId, ref: 'location', default: null }],
        batchesDeliver: [{
            goodsNote: { type: ObjectId, ref: 'goodsInNotes', default: null },
            qty: Number,
            cost: Number
        }],

        locationsReceived: [{
            _id: false,
            location: { type: ObjectId, ref: 'location', default: null },
            qty: Number
        }],

        cost: { type: Number, default: 0 },
        qty: Number
    }]

});

function saveOrder(next) {
    var self = this;
    var SeqModel = MODEL('Sequence').Schema;
    var EntityModel = MODEL('entity').Schema;

    if (this.isNew)
        this.history = [];

    if (self.isNew && !self.ref)
        return SeqModel.inc("ORDER", function(seq, number) {
            //console.log(seq);
            self.ID = number;
            EntityModel.findOne({
                _id: self.entity
            }, "cptRef", function(err, entity) {
                if (err)
                    console.log(err);

                if (entity && entity.cptRef)
                    self.ref = (self.forSales == true ? "CO" : "CF") + entity.cptRef + seq;
                else
                    self.ref = (self.forSales == true ? "CO" : "CF") + seq;
                next();
            });
        });

    if (self.date_livraison)
        self.ref = F.functions.refreshSeq(self.ref, self.date_livraison);

    next();
}

function saveQuotation(next) {
    var self = this;
    var SeqModel = MODEL('Sequence').Schema;
    var EntityModel = MODEL('entity').Schema;

    if (this.isNew)
        this.history = [];

    if (self.isNew && !self.ref)
        return SeqModel.inc("ORDER", function(seq, number) {
            //console.log(seq);
            self.ID = number;
            EntityModel.findOne({
                _id: self.entity
            }, "cptRef", function(err, entity) {
                if (err)
                    console.log(err);

                if (entity && entity.cptRef)
                    self.ref = (self.forSales == true ? "PC" : "DA") + entity.cptRef + seq;
                else
                    self.ref = (self.forSales == true ? "PC" : "DA") + seq;
                next();
            });
        });

    self.ref = F.functions.refreshSeq(self.ref, self.datec);
    next();
}

function setNameDelivery(next) {
    var self = this;
    var SeqModel = MODEL('Sequence').Schema;
    var EntityModel = MODEL('entity').Schema;
    var OrderModel = MODEL('order').Schema.Order;

    if (self.isNew && self.order === self._id)
        return SeqModel.inc("ORDER", function(seq, number) {
            //console.log(seq);
            self.ID = number;
            EntityModel.findOne({
                _id: self.entity
            }, "cptRef", function(err, entity) {
                if (err)
                    console.log(err);

                if (entity && entity.cptRef)
                    self.ref = (self.forSales == true ? "BL" : "RE") + entity.cptRef + seq;
                else
                    self.ref = (self.forSales == true ? "BL" : "RE") + seq;
                next();
            });
        });

    if (self.isNew && !self.ref)
        return OrderModel.findById(self.order, "ref ID", function(err, order) {
            SeqModel.incCpt(order._id, function(number) {
                //console.log(seq);

                self.ref = (self.forSales == true ? "BL" : "RE") + order.ref.substring(2) + '/' + number;

                next();
            });
        });

    if (self.date_livraison)
        self.ref = F.functions.refreshSeq(self.ref, self.date_livraison);
    next();
}

function setNameTransfer(next) {
    var transaction = this;
    var db = transaction.db.db;
    var prefix = 'TX';

    db.collection('settings').findOneAndUpdate({
        dbName: db.databaseName,
        name: prefix
    }, {
        $inc: { seq: 1 }
    }, {
        returnOriginal: false,
        upsert: true
    }, function(err, rate) {
        if (err) {
            return next(err);
        }

        transaction.name = prefix + '-' + rate.value.seq;

        next();
    });
}

function setNameReturns(next) {
    var transaction = this;
    var db = transaction.db.db;
    var prefix = 'RT';

    db.collection('settings').findOneAndUpdate({
        dbName: db.databaseName,
        name: prefix
    }, {
        $inc: { seq: 1 }
    }, {
        returnOriginal: false,
        upsert: true
    }, function(err, rate) {
        if (err) {
            return next(err);
        }

        transaction.name = prefix + '-' + rate.value.seq;

        next();
    });
}

orderCustomerSchema.pre('save', saveOrder);
orderSupplierSchema.pre('save', saveOrder);
quotationCustomerSchema.pre('save', saveQuotation);
quotationSupplierSchema.pre('save', saveQuotation);

goodsOutNoteSchema.pre('save', setNameDelivery);
stockTransactionsSchema.pre('save', setNameTransfer);
goodsInNoteSchema.pre('save', setNameDelivery);
stockReturnSchema.pre('save', setNameReturns);

//goodsOutNoteSchema.statics.getById = getDeliveryById;
//goodsInNoteSchema.statics.getById = getDeliveryById;

const orderCustomer = Order.discriminator('orderCustomer', orderCustomerSchema);
const orderSupplier = Order.discriminator('orderSupplier', orderSupplierSchema);
const quotationCustomer = Order.discriminator('quotationCustomer', quotationCustomerSchema);
const quotationSupplier = Order.discriminator('quotationSupplier', quotationSupplierSchema);

const goodsOutNote = Order.discriminator('GoodsOutNote', goodsOutNoteSchema);
const stockTransactions = Order.discriminator('stockTransactions', stockTransactionsSchema);
const stockReturns = Order.discriminator('stockReturns', stockReturnSchema);
const stockCorrection = Order.discriminator('stockCorrections', stockCorrectionSchema);
const goodsInNote = Order.discriminator('GoodsInNote', goodsInNoteSchema);

exports.Schema = {
    Order: Order, //Only for READING
    OrderCustomer: orderCustomer,
    OrderSupplier: orderSupplier,
    QuotationCustomer: quotationCustomer,
    QuotationSupplier: quotationSupplier,

    GoodsOutNote: goodsOutNote,
    GoodsInNote: goodsInNote,
    stockCorrections: stockCorrection,
    stockTransactions: stockTransactions,
    stockReturns: stockReturns
};

exports.Status = {
    "_id": "fk_order_status",
    "lang": "orders",
    "values": {
        "DRAFT": {
            "enable": true,
            "label": "StatusOrderDraft",
            "cssClass": "ribbon-color-default label-default",
            "system": true
        },
        "VALIDATED": {
            "enable": true,
            "label": "StatusOrderValidated",
            "cssClass": "ribbon-color-warning label-warning"
        },
        "CANCELED": {
            "enable": true,
            "label": "StatusOrderCanceled",
            "cssClass": "ribbon-color-danger label-danger",
            "system": true
        },
        "SEND": {
            "enable": true,
            "label": "StatusOrderSend",
            "cssClass": "ribbon-color-primary label-primary"
        },
        "PROCESSING": {
            "enable": true,
            "label": "StatusOrderProcessing",
            "cssClass": "ribbon-color-info label-info"
        },
        "SHIPPING": {
            "label": "StatusOrderSending",
            "enable": true,
            "cssClass": "ribbon-color-success label-success"
        },
        "CLOSED": {
            "enable": true,
            "label": "StatusOrderClosed",
            "cssClass": "ribbon-color-success label-success",
            "system": true
        },
        "ERROR": {
            "label": "StatusOrderError",
            "cssClass": "ribbon-color-danger label-danger",
            "system": true
        },
        "BILLING": {
            "label": "StatusOrderToBill",
            "cssClass": "ribbon-color-default label-default"
        },
        "BILLED": {
            "enable": true,
            "label": "StatusOrderToBill",
            "cssClass": "ribbon-color-primary label-primary",
            "system": true
        },
        "NEW": {
            "enable": true,
            "label": "PropalStatusNew",
            "cssClass": "ribbon-color-info label-info"
        },
        "SIGNED": {
            "enable": true,
            "label": "PropalStatusClosed",
            "cssClass": "ribbon-color-danger label-danger",
            "system": true
        },
        "NOTSIGNED": {
            "enable": true,
            "label": "PropalStatusNotSigned",
            "cssClass": "ribbon-color-warning label-warning",
            "system": true
        }
    }
};

exports.name = "order";