/* eslint-disable */
import { showAlert } from './alerts.js';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/update-password'
        : '/api/v1/users/update-user';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      console.log("dhhs");
      window.setTimeout(() => {
        console.log('Redirecting to homepage...');
        location.assign('/');
      }, 1000);
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      
      // Debugging log to check if this part is reached
      console.log('Update successful, preparing to redirect.');

      
    }
  } catch (err) {
    // Debugging log to check if an error occurred
    console.error('Update failed:', err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};
