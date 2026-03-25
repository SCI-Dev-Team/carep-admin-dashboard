"use client";

import React from "react";
import Image from "next/image";
import { brand } from "@/app/lib/brand";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-emerald-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-emerald-100 shrink-0 shadow-sm">
              <Image src={brand.logo} alt={brand.projectName} width={48} height={48} className="object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-900">{brand.projectName}</h1>
              <p className="text-xs text-emerald-600">{brand.tagline}</p>
            </div>
          </div>
          {/* Hidden login link - accessible via typing the URL directly */}
          <a 
            href="/dashboard" 
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors opacity-0 hover:opacity-100"
            aria-hidden="true"
          >
            •
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              AI-Powered Disease Detection
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Protect Your Crops with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                Intelligent Detection
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Our advanced Telegram bot uses deep learning and AI to detect crop diseases instantly 
              and provide personalized curing recommendations for your vegetables.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="https://t.me/savecropbot" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                Start Using Bot
              </a>
              <a 
                href="#features" 
                className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-all border-2 border-emerald-200 hover:border-emerald-300"
              >
                Learn More
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our system combines multiple AI technologies to give you the most accurate disease detection and recommendations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl border border-emerald-100 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Deep Learning Models</h3>
              <p className="text-slate-600 leading-relaxed">
                Custom-trained neural networks specifically designed for detecting diseases in your vegetables. 
                Each model is trained on thousands of real-world crop images for maximum accuracy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">LLM-Powered Filtering</h3>
              <p className="text-slate-600 leading-relaxed">
                Advanced language models intelligently filter and categorize vegetable types, 
                ensuring your images are processed by the correct specialized detection model.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-2xl border border-teal-100 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Personalized Recommendations</h3>
              <p className="text-slate-600 leading-relaxed">
                Get detailed treatment plans and prevention strategies tailored to your specific crop condition, 
                helping you save your harvest and prevent future outbreaks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get disease detection and treatment recommendations in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Send a Photo</h3>
              <p className="text-slate-600">
                Take a photo of your affected crop and send it to our Telegram bot
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Analysis</h3>
              <p className="text-slate-600">
                Our deep learning models analyze the image and detect any diseases
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Get Solutions</h3>
              <p className="text-slate-600">
                Receive instant treatment recommendations and prevention tips
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Vegetables */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Supported Vegetables
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our AI models are trained with deep learning to detect diseases in these vegetables
            </p>
          </div>

          {/* Cucumber Family */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold">1</span>
              Cucumber Family (Cucurbitaceae)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: "Cucumber", icon: "🥒" },
                { name: "Watermelon", icon: "🍉" },
                { name: "Yellow Watermelon", icon: "🍈" },
                { name: "Wax Gourd", icon: "🫙" },
                { name: "Pumpkin", icon: "🎃" },
                { name: "Squash", icon: "🥕" },
              ].map((veg) => (
                <div 
                  key={veg.name}
                  className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-xl border border-emerald-100 text-center hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="text-4xl mb-2">{veg.icon}</div>
                  <h4 className="font-semibold text-slate-900 text-sm">{veg.name}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Cauliflower Family */}
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold">2</span>
              Cauliflower Family (Brassica oleracea)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name: "Cauliflower", icon: "🥦" },
                { name: "Broccoli", icon: "🥦" },
                { name: "Romanesco", icon: "🥦" },
                { name: "Broccolini", icon: "🥦" },
                { name: "Cabbage", icon: "🥬" },
              ].map((veg) => (
                <div 
                  key={veg.name}
                  className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-100 text-center hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="text-4xl mb-2">{veg.icon}</div>
                  <h4 className="font-semibold text-slate-900 text-sm">{veg.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Protect Your Crops?
          </h2>
          <p className="text-xl text-emerald-50 mb-8">
            Join farmers who are using AI to save their harvests
          </p>
          <a 
            href="https://t.me/savecropbot" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-emerald-700 px-10 py-5 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-2xl hover:shadow-xl transform hover:-translate-y-1"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
            </svg>
            Start Using {brand.projectName} Bot
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                  <Image src={brand.logo} alt={brand.projectName} width={40} height={40} className="object-contain" />
                </div>
                <h3 className="text-xl font-bold">{brand.projectName}</h3>
              </div>
              <p className="text-slate-400 text-sm">
                {brand.tagline}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
                <li><a href="https://t.me/savecropbot" className="hover:text-emerald-400 transition-colors">Start Bot</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-slate-400">
                Need help?<br />
                <a href="mailto:support@carep.org" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  support@carep.org
                </a>
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} {brand.projectName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
