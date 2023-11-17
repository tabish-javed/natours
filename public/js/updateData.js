import { showAlert } from "./alerts";
import helper from "./helper";

// type is either 'password' or 'normal data'
export async function updateUserData (data, type) {
    try {
        const url = type === 'password'
            ? 'http://localhost:3000/api/v1/users/updatePassword'
            : 'http://localhost:3000/api/v1/users/updateMe';

        const response = await helper.AJAX(url, data, 'PATCH');

        if (response.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully!`);
        } else return;

    } catch (error) {
        showAlert('error', error);
    }
}