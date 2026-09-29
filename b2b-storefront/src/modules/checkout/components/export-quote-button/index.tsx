"use client"

import React from "react"

const ExportQuoteButton = () => {
  const handlePrint = () => {
    // Basic logic to print the current page as a PDF quote
    window.print()
  }

  return (
    <button 
      onClick={handlePrint}
      className="w-full border-2 border-red-700 text-red-700 font-bold py-3 hover:bg-red-50 transition-colors rounded flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      Exportar Cotización a PDF
    </button>
  )
}

export default ExportQuoteButton
