// sellcars.js
document.getElementById('sell-car-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Use the global client we established
    const supabase = window.supabaseClient;

    // 1. Check if user is logged in
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
        alert("You must be logged in to list a vehicle.");
        window.location.href = 'login.html';
        return;
    }

    const formData = new FormData(e.target);
    const carData = {
        user_id: user.id, // Associate the post with the user
        brand: formData.get('brand'),
        model: formData.get('model'),
        year: formData.get('year'),
        price: formData.get('price'),
        condition: formData.get('condition'),
        description: formData.get('description'),
        image_url: formData.get('image_url') // Ensure this matches your table column
    };

    try {
        const { data, error } = await supabase
            .from('cars')
            .insert([carData]);

        if (error) throw error;

        alert('Car listed successfully!');
        window.location.href = 'cars.html';
    } catch (error) {
        console.error('Error:', error.message);
        alert('Error listing car: ' + error.message);
    }
});