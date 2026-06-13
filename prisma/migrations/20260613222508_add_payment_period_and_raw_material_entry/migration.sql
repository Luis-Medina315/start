-- CreateTable
CREATE TABLE "PaymentPeriod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "pricePerLiter" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RawMaterialEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientName" TEXT NOT NULL,
    "liters" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentPeriodId" INTEGER NOT NULL,
    CONSTRAINT "RawMaterialEntry_paymentPeriodId_fkey" FOREIGN KEY ("paymentPeriodId") REFERENCES "PaymentPeriod" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
