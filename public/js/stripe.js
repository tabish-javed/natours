import { showAlert } from "./alerts";


export async function bookTour (tourId) {
    const stripe = Stripe('pk_test_51OU260SIEXBr10IrjwOdz4wwqJXiGDconWUnGTj2nDW7twzokGKMXHt7j3pzIJkc2bGtS8kRS0MVHFMzMuunj3r300l6kNhEAu');

    try {
        // 1- Get checkout session form API
        const response = await fetch(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`, {
            method: 'GET'
        });
        const session = await response.json();

        // 2- Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.session.id
        });
    } catch (error) {
        showAlert('error', error);
    }
}
