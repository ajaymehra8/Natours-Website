import { showAlert } from "./alerts.js";
const loginBtn=document.querySelector(".btn--login");

export const login = async (email, password) => {
  loginBtn.textContent="Processing..."
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    loginBtn.textContent="Login"
    if (res.data.status === 'success') {
      showAlert('success','Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    } else {
      showAlert('error',res.data.message);
    }
  } catch (err) {
    showAlert('error','Problem in login.');

    // console.log(err.response.data);
  }
};

export const logout=async()=>{
  try{
    // console.log('hello');
const res=await axios({
  method:'GET',
  url:'/api/v1/users/logout'
});
location.assign('/');
  }catch(err){
    showAlert('error','Problem in logging out! Try again.')
  }
}