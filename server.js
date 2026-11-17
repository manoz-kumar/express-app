import express from 'express';

const app = express();-

app.use(express.json());

const products = [];

app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000');
});

app.post('/products', (req, res) => {
    const newproduct = req.body;

    products.push(newproduct);

    res.status(201).json({
        message: 'Product created successfully',
        data: newproduct
    });
});

app.get('/products', (req, res) => {
    res.status(200).json({
        message: 'Products retrieved successfully',
        data: products
    });
});

app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);

    const product = products.find(p => p.id === productId);

    if (product) {
        res.status(200).json({
            message: 'Product retrieved successfully',
            data: product
        });
    } else {
        res.status(404).json({
            message: 'Product not found'
        });
    }
});

app.put('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);

    const updatedProduct = req.body;

    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex !== -1) {
        products[productIndex] = {
            ...products[productIndex],
            ...updatedProduct
        };

        res.status(200).json({
            message: 'Product updated successfully',
            data: products[productIndex]
        });
    } else {
        res.status(404).json({
            message: 'Product not found'
        });
    }
});

app.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);

    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex !== -1) {
        products.splice(productIndex, 1);

        res.status(200).json({
            message: 'Product deleted successfully'
        });
    } else {
        res.status(404).json({
            message: 'Product not found'
        });
    }
});