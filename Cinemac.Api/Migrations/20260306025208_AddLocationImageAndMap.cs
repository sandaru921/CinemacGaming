using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cinemac.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationImageAndMap : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoogleMapUrl",
                table: "Locations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Locations",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoogleMapUrl",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Locations");
        }
    }
}
