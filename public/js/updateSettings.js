import { showAlert } from "./alerts";
import helper from "./helper";

export async function updateUserData (name, email) {
    try {
        const response = await helper.AJAX('http://localhost:3000/api/v1/users/updateMe',
            {
                name: name,
                email: email
            },
            'PATCH'
        );

        if (response.status === 'success') {
            showAlert('success', 'Data updated successfully!');
            setTimeout(() => {
                location.assign('/me');
            }, 2_000);
        } else return;

    } catch (error) {
        showAlert('error', error);
    }
}