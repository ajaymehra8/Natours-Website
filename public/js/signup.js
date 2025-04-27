import { showAlert } from "./alerts.js";
const signupBtn=document.querySelector(".btn--signup");
export const signup = async (name,email, password,passwordConfirm) => {
  signupBtn.textContent="Processing...";
  try {

    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm
      },
    });
    signupBtn.textContent="Signup";
    if (res.data.status === 'success') {
      showAlert('success','Check your email for otp');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    } else {
      showAlert('error',res.data.message);
      signupBtn.textContent="Sign up";

    }
  } catch (err) {
    showAlert('error','Problem in signup');
    signupBtn.textContent="Sign up";

    // console.log(err.response.data);
  }
};

