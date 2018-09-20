let mongoose = require('mongoose');
let Schema = mongoose.Schema;

module.exports = new Schema({
    _id: { type: Schema.Types.Mixed, es_indexed: true, es_type: 'keyword' },
    brand: {
        type: Schema.Types.String,
        required: true,
        es_indexed: true,
        es_type: 'text',
    },
    name: {
        type: Schema.Types.String,
        required: true,
        es_indexed: true,
        es_type: 'text',
    },
    brandname: {
        type: Schema.Types.String,
        required: true,
        es_indexed: true,
        es_type: 'completion',
        es_analyzer: "standard",
        es_search_analyzer: "standard"
    },
    namebrand: {
        type: Schema.Types.String,
        required: true,
        es_indexed: true,
        es_type: 'completion',
        es_analyzer: "standard",
        es_search_analyzer: "standard"
    },
    tax: { type: Schema.Types.Number, es_indexed: false },
    container: { type: Schema.Types.String, es_indexed: false },
    images: {
        image_catalog: {
            type: Schema.Types.String,
            required: true,
            es_indexed: true,
            es_type: 'text'
        },
        images_all: [
            {
                type: Schema.Types.String,
                required: true,
                es_indexed: true,
                es_type: 'text'
            }]
    },
    category: {
        category_display_name: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'keyword'
        },
        category_name: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'keyword'
        },
        category_image: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'keyword'
        },
        category_cover: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'keyword'
        }
    },
    subcategory: {
        value: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'keyword'
        },
        weight: {
            value: {
                type: Schema.Types.Number,
                es_indexed: true,
            },
        }
    },
    store: {
        name: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'keyword'
        },
        display_name: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'text'
        },
        image_url: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'text'
        },
    },
    visible: { type: Schema.Types.Mixed, es_indexed: true, es_type: 'text' },
    details: {
        ingredients: {
            display_name: { type: Schema.Types.String, es_indexed: false },
            description: { type: Schema.Types.String, es_indexed: true, es_type: 'text' }
        },
        preview: {
            display_name: { type: Schema.Types.String, es_indexed: false },
            description: { type: Schema.Types.String, es_indexed: true, es_type: 'text' }
        },
        country_of_origin: {
            display_name: { type: Schema.Types.String, es_indexed: false },
            description: { type: Schema.Types.String, es_indexed: true, es_type: 'text' }
        },
        serving_suggestions: {
            display_name: { type: Schema.Types.String, es_indexed: false },
            description: { type: Schema.Types.String, es_indexed: true, es_type: 'text' }
        }
    },
    tags: [
        {
            name: { type: Schema.Types.String, es_indexed: true, es_type: 'keyword' },
            rating: { type: Schema.Types.Number, es_indexed: true, es_type: 'integer' },
            icon_url: { type: Schema.Types.String, es_indexed: false }
        }
    ],
    variance: [
        {
            _id: { type: Schema.Types.Mixed, es_indexed: false },
            si_unit_size: { type: Schema.Types.Number, es_indexed: true, es_type: 'integer' },
            si_unit: { type: Schema.Types.String, es_indexed: true, es_type: 'text' },
            preffered_unit: { type: Schema.Types.String, es_indexed: true, es_type: 'text' },
            preffered_unit_size: { type: Schema.Types.String, es_indexed: true, es_type: 'text' },
            packs: [
                {
                    _id: { type: Schema.Types.Mixed, es_indexed: false },
                    h_value: { type: Schema.Types.Number, es_indexed: true, es_type: 'integer' },
                    price: { type: Schema.Types.Number, es_indexed: true, es_type: 'integer' },
                    visible: { type: Schema.Types.Number, es_indexed: true, es_type: 'integer' },
                    stock_quantity: { type: Schema.Types.Number, es_indexed: true, es_type: 'integer' },
                    sold: {
                        quantity: { type: Schema.Types.Number, es_indexed: false },
                    }
                }
            ]
        }
    ]
});