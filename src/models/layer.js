import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Perform currency conversion using an external API based on sender and
//receiver currencies and an amount.
export async function currencyConverter(
  receiver_currency,
  sender_currency,
  amount
) {
  const apiKey = process.env.APIKEY;

  // Construct the URL with the actual values
  const url = `https://api.apilayer.com/exchangerates_data/convert?to=${receiver_currency}&from=${sender_currency}&amount=${amount}`;

  try {
    const response = await axios.get(url, {
      headers: {
        apikey: apiKey,
      },
    });

    const data = response.data;
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function getCurrencyList() {
  const apiKey = process.env.APIKEY;
  const url = "https://api.apilayer.com/currency_data/list";

  try {
    const response = await axios.get(url, {
      headers: {
        apikey: apiKey,
      },
    });

    const data = response.data;
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export function isSupportedCurrency(currencyCode, currencyList) {
  return currencyList.hasOwnProperty(currencyCode);
}
