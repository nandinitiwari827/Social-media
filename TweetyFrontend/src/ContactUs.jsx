import React from 'react'

function ContactUs() {
  return (
    <>
      <div className='flex justify-center items-center min-h-screen px-4'>
        <div className='flex flex-col sm:flex-row justify-center items-center text-orange-500 gap-6 text-center'>
          <p className='text-2xl sm:text-3xl md:text-4xl font-semibold'>
            Koi zarurat nai h contact krne ki, padai kr 😄
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 128 128"
          >
            <path
              fill="#ffca28"
              d="M77.6 48.8c7-1.4 13.8-.7 17.2-.2c3.8.5 9.1 1.3 13.2 3.2c4.7 2.1 5.9 5.7 6 10c.1 4-1.1 6.4-2.5 7.7c4.2 2.3 5.2 5 5 9.5c-.2 4-2 7.1-5.6 8.9c2.9 3.1 3.5 5.5 3 10.2c-.4 4.4-2.1 7-9 9c1.3 1.4 1.7 3.8 1.6 6c-.2 2.6-1 5.1-4.6 6.9c-1 .5-6.9 3.4-19.2-.5c-10.4 1.8-24.9.9-36.4-4.6c-10.9-.1-23.8-1-24.8-1c-1.1 0-3.2-.5-4.2-3.3S13.2 86.7 16.1 74c.4-1.8 1.9-2.8 3.2-2.9s8.6-.9 10.3-1.1c9-1.1 6.8-8.9 17.2-21.3c4.9-5.9 14.9-10 15.5-23.1c.2-4.4.5-11.6.5-12.6c0-6.3 12.2-7.5 16.6 1.2c7.9 15.5 1.4 23.1-1.8 34.6"
            />
          </svg>
        </div>
      </div>
    </>
  )
}

export default ContactUs
