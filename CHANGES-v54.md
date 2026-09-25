# Central v54

## Case Sales Tracker

- Rebuilt the Commerce7 case-sales calculation to follow the transaction-level rules exactly:
  - include only rows where `Type = Wine`
  - group Wine rows by unique `Id`
  - sum `Bottle Quantity` across the whole transaction, using `Quantity` only when Bottle Quantity is blank
  - calculate whole cases only after the full transaction is combined
  - never combine separate transactions to create a case
  - never count refund/exchange transactions as new case transactions
  - match `Refund/Exchange From Order Number` back to qualifying original `Order Number` values
  - preserve both Gross Number of Cases Sold and Cases Remaining After Linked Refunds
- The goal tracker now uses Cases Remaining After Linked Refunds as the number counting toward the goal.
- Added transaction-level validation data without retaining customer details or the raw CSV.
- Added Admin-only Case Refund Review and a collapsible Validation Table containing every qualifying original case transaction.
- Report Details are now Admin-only.
- Increased Case Sales Tracker typography and simplified the progress area into separate, larger Cases to Go, Days Remaining, and Needed per Day metrics.
- Replaced the last-10-days chart with a full month Daily Case Sales grid. Future dates are marked as not reported, and refund-adjusted dates are clearly identified.

## Validation against the supplied September 2026 Commerce7 export

- Gross Number of Cases Sold: 287
- Cases Remaining After Linked Refunds: 286
- Transactions Featuring a Case or More: 237
- One linked case-sale refund was found: refund/exchange order 62993 is linked to original order 62855 and reduces that original 12-bottle transaction from 1 case to 0 cases remaining.
