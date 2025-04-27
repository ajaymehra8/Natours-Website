/* eslint-disable */
import { showAlert } from './alerts.js';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  const updateBtn = document.querySelector('.updateBtn');
  try {
    updateBtn.innerText = 'Updating...';
    const url =
      type === 'password'
        ? '/api/v1/users/update-password'
        : '/api/v1/users/update-user';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/me');
      }, 1000);
      showAlert(
        'success',
        `${type.toUpperCase()} updated successfully!`,
      );

      // Debugging log to check if this part is reached
      updateBtn.innerText = 'Save settings';
    }
  } catch (err) {
    // Debugging log to check if an error occurred
    showAlert('error', err.response.data.message);
    updateBtn.innerText = 'Save settings';
  }
};
