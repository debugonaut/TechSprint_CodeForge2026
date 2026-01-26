const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const verifyToken = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(verifyToken);

// GET /api/collections - Get all user collections
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db.collection('users').doc(userId).collection('collections')
      .orderBy('created_at', 'desc')  
      .get();
    
    const collections = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));

    res.json(collections);

  } catch (error) {
    console.error('Error in GET /collections:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/collections - Create new collection
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const userId = req.user.uid;

    if (!name) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const collectionData = {
      name,
      description: description || '',
      color: color || '#8B5CF6', // Default purple
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      item_count: 0
    };

    const docRef = await db.collection('users').doc(userId).collection('collections')
      .add(collectionData);

    res.status(201).json({
      id: docRef.id,
      message: 'Collection created successfully',
      data: collectionData
    });

  } catch (error) {
    console.error('Error in POST /collections:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/collections/:id - Update collection
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    const userId = req.user.uid;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color) updateData.color = color;

    await db.collection('users').doc(userId).collection('collections')
      .doc(id)
      .update(updateData);

    res.json({ 
      message: 'Collection updated successfully',
      id,
      data: updateData
    });

  } catch (error) {
    console.error('Error in PUT /collections/:id:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/collections/:id - Delete collection
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Note: Items in this collection will just lose their collectionId reference
    // They won't be deleted, just removed from the collection
    await db.collection('users').doc(userId).collection('collections')
      .doc(id)
      .delete();

    res.json({ 
      message: 'Collection deleted successfully',
      id 
    });

  } catch (error) {
    console.error('Error in DELETE /collections/:id:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/collections/:id/items - Add item to collection
router.post('/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const { itemId } = req.body;
    const userId = req.user.uid;

    if (!itemId) {
      return res.status(400).json({ error: 'itemId is required' });
    }

    // Update the item to add collectionId
    await db.collection('users').doc(userId).collection('saved_content')
      .doc(itemId)
      .update({
        collectionId: id,
        updated_at: new Date().toISOString()
      });

    // Increment collection item count
    const collectionRef = db.collection('users').doc(userId).collection('collections').doc(id);
    const collectionDoc = await collectionRef.get();
    
    if (collectionDoc.exists) {
      const currentCount = collectionDoc.data().item_count || 0;
      await collectionRef.update({
        item_count: currentCount + 1,
        updated_at: new Date().toISOString()
      });
    }

    res.json({ 
      message: 'Item added to collection successfully',
      collectionId: id,
      itemId
    });

  } catch (error) {
    console.error('Error in POST /collections/:id/items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/collections/:id/items/:itemId - Remove item from collection
router.delete('/:id/items/:itemId', async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const userId = req.user.uid;

    // Remove collectionId from the item
    await db.collection('users').doc(userId).collection('saved_content')
      .doc(itemId)
      .update({
        collectionId: null,
        updated_at: new Date().toISOString()
      });

    // Decrement collection item count
    const collectionRef = db.collection('users').doc(userId).collection('collections').doc(id);
    const collectionDoc = await collectionRef.get();
    
    if (collectionDoc.exists) {
      const currentCount = collectionDoc.data().item_count || 0;
      await collectionRef.update({
        item_count: Math.max(0, currentCount - 1),
        updated_at: new Date().toISOString()
      });
    }

    res.json({ 
      message: 'Item removed from collection successfully',
      collectionId: id,
      itemId
    });

  } catch (error) {
    console.error('Error in DELETE /collections/:id/items/:itemId:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
