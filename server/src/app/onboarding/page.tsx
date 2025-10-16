"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { DEVICE_NAME } from "@/constants";

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const step = searchParams.get("step");

  const handleNext = (nextStep: number) => {
    router.push(`/onboarding?step=${nextStep}`);
  };

  const handleBack = (prevStep: number | null) => {
    if (prevStep === null) {
      router.push("/onboarding");
    } else {
      router.push(`/onboarding?step=${prevStep}`);
    }
  };

  // Initial landing page
  if (step === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-4xl font-bold text-balance">
            Connect your {DEVICE_NAME} to WiFi
          </h1>
          <p className="text-lg text-foreground/70 text-balance">
            Let's get your device connected and ready to display your GitHub contribution graph.
          </p>
          <Link
            href="/onboarding?step=0"
            className="inline-block px-8 py-4 bg-foreground text-background rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  // Step 0: Connect device via USB-C
  if (step === "0") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <button
            onClick={() => handleBack(null)}
            className="mb-8 w-12 h-12 flex items-center justify-center rounded-full border-2 border-foreground/20 hover:border-foreground/40 transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="space-y-6">
            <div className="text-sm text-foreground/50 font-medium">STEP 1 OF 3</div>
            <h1 className="text-3xl font-bold text-balance">
              Connect your device to your computer using a USB-C cable
            </h1>
            <p className="text-lg text-foreground/70 text-balance">
              Plug one end of the USB-C cable into your {DEVICE_NAME} and the other end into your computer.
            </p>
            
            <div className="pt-8">
              <button
                onClick={() => handleNext(1)}
                className="px-8 py-4 bg-foreground text-background rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                I've connected it
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Choose WiFi network
  if (step === "1") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <button
            onClick={() => handleBack(0)}
            className="mb-8 w-12 h-12 flex items-center justify-center rounded-full border-2 border-foreground/20 hover:border-foreground/40 transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="space-y-6">
            <div className="text-sm text-foreground/50 font-medium">STEP 2 OF 3</div>
            <h1 className="text-3xl font-bold text-balance">
              Choose WiFi network
            </h1>
            <div className="space-y-4">
              <p className="text-lg text-foreground/70 text-balance">
                In your WiFi settings, select the network named:
              </p>
              <div className="p-4 bg-foreground/5 rounded-lg border border-foreground/10">
                <code className="text-lg font-mono font-semibold">GithubDisplay-Service</code>
              </div>
              <p className="text-foreground/60 text-sm text-balance">
                ⚠️ Notice that your computer will be temporarily disconnected from the internet while connected to this network.
              </p>
            </div>
            
            <div className="pt-8">
              <button
                onClick={() => handleNext(2)}
                className="px-8 py-4 bg-foreground text-background rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                I've connected to the network
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Configure WiFi via web panel
  if (step === "2") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <button
            onClick={() => handleBack(1)}
            className="mb-8 w-12 h-12 flex items-center justify-center rounded-full border-2 border-foreground/20 hover:border-foreground/40 transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="space-y-6">
            <div className="text-sm text-foreground/50 font-medium">STEP 3 OF 3</div>
            <h1 className="text-3xl font-bold text-balance">
              Configure your local WiFi
            </h1>
            <div className="space-y-4">
              <p className="text-lg text-foreground/70 text-balance">
                Now let's connect your {DEVICE_NAME} to your home WiFi network.
              </p>
              
              <ol className="space-y-3 list-decimal list-inside text-foreground/80">
                <li>
                  Open the WiFi configuration panel at{" "}
                  <Link 
                    href="http://192.168.4.1" 
                    target="_blank"
                    className="text-foreground underline hover:opacity-70 transition-opacity font-mono"
                  >
                    192.168.4.1
                  </Link>
                </li>
                <li>Select your home WiFi network from the list</li>
                <li>Enter your WiFi password</li>
                <li>Submit the form</li>
              </ol>

              <div className="p-6 bg-foreground/5 rounded-lg border border-foreground/10 space-y-3">
                <p className="text-sm font-semibold text-foreground/70">💡 Helpful Tips</p>
                <ul className="text-sm text-foreground/60 space-y-2 list-disc list-inside">
                  <li>Make sure you enter the correct password</li>
                  <li>The device will automatically restart after configuration</li>
                  <li>You can reconnect your computer to your regular WiFi network after submitting</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8">
              <button
                onClick={() => handleNext(3)}
                className="px-8 py-4 bg-foreground text-background rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Final success message
  if (step === "3") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-balance">All set!</h1>
          
          <p className="text-lg text-foreground/70 max-w-md mx-auto text-balance">
            If the password is correct, your {DEVICE_NAME} should now display your GitHub contribution graph.
          </p>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-foreground text-background rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for invalid steps
  return null;
}
