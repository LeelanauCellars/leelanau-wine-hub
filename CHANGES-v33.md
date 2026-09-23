# Wine Hub v33

- Replaced the in-page DYMO print CSS workaround with a dedicated isolated print window.
- The print window contains no Wine Hub letter-size print rules, no named @page rule, and no app-level rotation.
- Labels are rendered directly at 2.25in × 1.25in with zero margins and inline vector Code 128 barcodes.
- Individual and queued labels use the same print path.
- DYMO 30334 should be printed with the printer driver set to Portrait, 30334 paper, 100% scale, and no margins.
