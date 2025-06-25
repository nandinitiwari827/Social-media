import React from 'react'
import { useNavigate } from 'react-router-dom'

function About() {
  let navigate = useNavigate()

  return (
    <>
      <div className='mx-3 sm:mx-6 md:mx-12 lg:mx-24 mt-16 rounded-2xl bg-blue-500 text-white py-10 text-center'>
        <button
          onClick={() => navigate("/contactus")}
          className='py-2 px-4 text-blue-500 bg-white hover:bg-gray-100 cursor-pointer rounded-xl text-sm sm:text-base'
        >
          CONTACT US
        </button>
        <p className='text-2xl sm:text-3xl md:text-4xl text-white mt-6 font-semibold'>
          Know More About Us
        </p>
      </div>
      <div className='flex flex-col lg:flex-row gap-6 mx-3 sm:mx-6 md:mx-12 lg:mx-24 mt-14 justify-center'>
        <div className='rounded-lg bg-gray-100 text-left py-5 px-5 w-full lg:w-1/2'>
          <p className='text-xl sm:text-2xl md:text-3xl font-semibold'>
            About The Project...
          </p>
          <p className='text-sm sm:text-base mt-4 leading-relaxed'>
            Tweety is a modern social media platform designed to help people connect, share, and express themselves freely. Whether it's posting updates, sharing photos, or discovering new friends, Tweety makes staying connected simple and meaningful.
          </p>
          <p className='text-sm sm:text-base mt-4 leading-relaxed'>
            Our mission is to bridge the gap between technology and emotion by providing an easy-to-use platform that's both intuitive and inclusive. Whether it's sharing daily updates, celebrating milestones, or engaging in thoughtful conversations, Tweety is your go-to place for staying connected in a fun and personal way.
          </p>
        </div>

        <div className='rounded-lg bg-gray-100 text-left py-5 px-5 w-full lg:w-1/2'>
          <img
            className='h-56 sm:h-64 md:h-72 lg:h-80 w-full object-cover rounded-lg'
            src="https://i.pinimg.com/736x/f6/9f/8a/f69f8aded90c13e633ecfab6c598b9d5.jpg"
            alt='Tweety Overview'
          />
          <p className='text-center text-sm sm:text-base mt-4 leading-relaxed'>
            From real-time posts and live chats to personalized feeds and interest-based communities, we're here to reshape the way you experience social media. Join us on this journey as we continue to innovate, connect people, and create a platform where your voice matters.
          </p>
        </div>
      </div>
      <div className='mt-16 mx-3 sm:mx-6 md:mx-12 lg:mx-24'>
        <p className='text-2xl sm:text-3xl font-semibold mb-8'>Our Story</p>

        <div className='flex flex-col lg:flex-row gap-6'>
          <div className='w-full lg:w-1/2'>
            <img
              className='shadow-2xl rounded-md w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover'
              src="https://i.pinimg.com/736x/d8/3f/dd/d83fdd46f340d10f8543891269b7c892.jpg"
              alt='Our Story Image'
            />
          </div>

          <div className='text-left w-full lg:w-1/2 flex flex-col justify-center'>
            <p className='font-bold text-base sm:text-lg'>
              In the age of countless social media platforms, many lost touch with what truly matters — real connections. We noticed how people were becoming numbers on a follower list rather than individuals with stories, thoughts, and emotions. That's when the idea for Tweety was born.
            </p>
            <p className='text-sm sm:text-base mt-3 leading-relaxed'>
              Our vision was simple: to create a digital space that feels like home. A platform where users can express themselves openly, share memories, discover like-minded communities, and build friendships beyond borders. What started as a small idea among a few passionate minds quickly turned into a growing network of people who value authenticity and kindness.
            </p>
            <button className='text-white bg-blue-500 py-2 px-4 mt-5 cursor-pointer hover:bg-blue-600 rounded-md w-max'>
              Learn more
            </button>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row gap-6 mt-14'>
          <div className='text-left w-full lg:w-1/2 flex flex-col justify-center'>
            <p className='font-bold text-base sm:text-lg'>
              Our platform encourages open conversations, supports creativity, and fosters a safe, respectful environment for everyone. From sharing casual moments to raising awareness on important issues, Tweety empowers its users to shape their digital world on their own terms.
            </p>
            <p className='text-sm sm:text-base mt-3 leading-relaxed'>
              Tweety isn't just another social media app; it's a movement towards a more meaningful online world. We believe every voice deserves to be heard and every story matters. Today, Tweety stands as a symbol of connection, positivity, and innovation — a place where your online experience truly belongs to you.
            </p>
            <button className='text-white bg-blue-500 py-2 px-4 mt-5 cursor-pointer hover:bg-blue-600 rounded-md w-max'>
              Learn more
            </button>
          </div>

          <div className='w-full lg:w-1/2'>
            <img
              className='shadow-2xl rounded-md w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover'
              src="https://i.pinimg.com/736x/cf/bf/88/cfbf883733bdeb47f7a15614361db074.jpg"
              alt='Tweety Story Image'
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default About
