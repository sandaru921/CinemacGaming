using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cinemac.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomPricingType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BasePricePerHour",
                table: "Rooms",
                newName: "Price");

            migrationBuilder.AddColumn<int>(
                name: "PricingType",
                table: "Rooms",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PricingType",
                table: "Rooms");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "Rooms",
                newName: "BasePricePerHour");
        }
    }
}
