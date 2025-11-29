/*
  Warnings:

  - You are about to drop the column `Username` on the `Users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[UserName]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `UserName` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[Users] DROP CONSTRAINT [Users_Username_key];

-- AlterTable
ALTER TABLE [dbo].[Users] DROP COLUMN [Username];
ALTER TABLE [dbo].[Users] ADD [UserName] NVARCHAR(1000) NOT NULL;

-- CreateIndex
ALTER TABLE [dbo].[Users] ADD CONSTRAINT [Users_UserName_key] UNIQUE NONCLUSTERED ([UserName]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
