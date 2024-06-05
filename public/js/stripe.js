/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51PN6woLGRnAugSG1CF3gAkjRj0IAuFPD6JoyuOn9vdG2moEG163xYBXNeiEwFEKWH1AFPt08ojD8x06jHDk5obuS00pW8V7rJ5');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    }); 

}catch (err) {
    //  console.log(err);
     showAlert('error', err);
   
}
};
