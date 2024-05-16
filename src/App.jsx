import axios from "axios";

function App() {
    let data = {
    name: "Jayant",
    amount:1100,
    number:'9871982780',
    MID: 'MID'+Date.now(),
    transactionId: 'TID'+Date.now()
    }
const handleClick = async () => {
        try{
            await axios.post('http://localhost:8000/order', data).then(res =>{
                console.log(res.data);
                if (res.data.status === true) {
                    window.location.href = res.data.data.instrumentResponse.redirectInfo.url
                }
            }).catch(err => {
                console.log(err);
            })
        } catch (error) {
            console.log(error);
        }
}
  return (
      <>
          <button onClick={handleClick}>Pay Now</button>
      </>
  )
}

export default App
