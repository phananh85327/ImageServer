namespace EFImageServer.Models
{
    public class Features
    {
        public int FeatureID { get; set; }
        public int PhotoID { get; set; }
        public byte[] ColorHistogram { get; set; }
        public byte[] TextureFeatures { get; set; }
        public byte[] ShapeDescriptors { get; set; }
    }
}
