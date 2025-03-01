namespace EFImageServer.Data
{
    public class Constants
    {
        public const int PAGE_ROWS = 20;
        public const int BUILD_KDTREE_SCHEDULE_HOUR = 23;
        public const bool BUILD_KDTREE = false;
        public const bool BUILD_KDTREE_ONSTARTUP = true;
        public const bool BUILD_FEATURES_FILE = true;
        public const double APPROXIMATE_LOCATION = 0.1;
        public const string FEATURES_FILE = "features.json";
        public const string DATETIME_FORMAT = "yyyy:MM:dd HH:mm:ss";
        public const string IMAGE_FOLDER = "Images";
        public const string PYTHON_VENV = "Python/.venv/Scripts/python.exe";
        public const string PYTHON_IMAGE_PROCESSING_SCRIPT_FILE_PATH = "Python/script1.py";
        public const string PYTHON_KD_TREE_SCRIPT_FILE_PATH = "Python/script2.py";
        public const string PYTHON_UPDATE_KD_TREE_SCRIPT_FILE_PATH = "Python/script3.py";
        public const string PYTHON_KNN_SCRIPT_FILE_PATH = "Python/script4.py";
        public const string EMAIL_ADDRESS = "";
        public const string EMAIL_PASSWORD = "";
    }
}
